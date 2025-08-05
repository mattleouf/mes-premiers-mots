import { setupDragDrop } from './drag-drop.mjs';
import { allSlotsFilled } from './word-check.mjs';
import { startConfetti as createConfettiEffect } from '../../js/confetti.js';
import { ensureRunning, playWord, playSuccess, playBubble } from './audio.mjs';

let stopConfettiEffect;
let bounceCount = 0;
let bounceHandler;
let currentTiles = [];
function parseLimit(value) {
  if (!value) return 30;
  return value === 'inf' ? Infinity : parseInt(value, 10);
}

let sessionLimit = parseLimit(sessionStorage.getItem('wordLimit'));
let wordsPlayed = 0;
const previewMode = localStorage.getItem('previewMode') || 'full';

function updateScale() {
  const layout = document.querySelector('.game-layout');
  if (!layout) return;
  const width = layout.offsetWidth;
  const height = layout.offsetHeight;
  const scale = Math.min(window.innerWidth / width, window.innerHeight / height, 1);
  layout.style.transform = `scale(${scale})`;
}

function findOffset(base, placed, tileW, tileH, maxX, maxY) {
  const area = tileW * tileH;
  let best = { x: 0, y: 0, overlap: Infinity };
  for (let i = 0; i < 20; i++) {
    const ox = (Math.random() * 2 - 1) * maxX;
    const oy = (Math.random() * 2 - 1) * maxY;
    const rect = { x: base.x + ox, y: base.y + oy };
    let worst = 0;
    for (const p of placed) {
      const ow = Math.max(0, Math.min(rect.x + tileW, p.x + tileW) - Math.max(rect.x, p.x));
      const oh = Math.max(0, Math.min(rect.y + tileH, p.y + tileH) - Math.max(rect.y, p.y));
      worst = Math.max(worst, ow * oh);
      if (worst > area * 0.2) break;
    }
    if (worst <= area * 0.2) {
      return { offsetX: ox, offsetY: oy };
    }
    if (worst < best.overlap) {
      best = { x: ox, y: oy, overlap: worst };
    }
  }
  return { offsetX: best.x, offsetY: best.y };
}

function layoutTiles(tiles) {
  const container = document.getElementById('tiles');
  if (!container || tiles.length === 0) return;
  const width = container.offsetWidth;
  const sampleSlot = document.querySelector('.slot');
  const tileW = sampleSlot ? sampleSlot.offsetWidth : 40;
  const tileH = sampleSlot ? sampleSlot.offsetHeight : 50;
  let cols = Math.min(tiles.length, Math.max(1, Math.floor(width / tileW)));
  let spacingX = (width - cols * tileW) / (cols + 1);
  while (cols > 1 && spacingX < tileW * 0.25) {
    cols--;
    spacingX = (width - cols * tileW) / (cols + 1);
  }
  spacingX = Math.max(spacingX, tileW * 0.25);
  const spacingY = tileH * 0.25;
  const rows = Math.ceil(tiles.length / cols);
  const neededHeight = rows * tileH + (rows + 1) * spacingY;
  container.style.height = `${neededHeight}px`;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols && positions.length < tiles.length; c++) {
      positions.push({
        x: spacingX + c * (tileW + spacingX),
        y: spacingY + r * (tileH + spacingY),
      });
    }
  }
  shuffle(positions);
  const placed = [];
  const maxOffsetX = Math.min(spacingX * 0.8, tileW * 0.4);
  const maxOffsetY = Math.min(spacingY * 0.8, tileH * 0.3);
  tiles.forEach((tile, idx) => {
    const pos = positions[idx];
    let offsetX = parseFloat(tile.dataset.offsetX);
    let offsetY = parseFloat(tile.dataset.offsetY);
    if (isNaN(offsetX) || isNaN(offsetY)) {
      ({ offsetX, offsetY } = findOffset(pos, placed, tileW, tileH, maxOffsetX, maxOffsetY));
      tile.dataset.offsetX = offsetX;
      tile.dataset.offsetY = offsetY;
    }
    const finalX = pos.x + offsetX;
    const finalY = pos.y + offsetY;
    tile.style.left = `${finalX}px`;
    tile.style.top = `${finalY}px`;
    placed.push({ x: finalX, y: finalY });
  });
}

function repositionTiles() {
  const active = currentTiles.filter((t) => !t.used);
  layoutTiles(active);
}

function handleResize() {
  repositionTiles();
  updateScale();
}

// Emoji history management
let wordHistory = [];

function loadHistory() {
  const stored = sessionStorage.getItem('wordHistory');
  wordHistory = stored ? JSON.parse(stored) : [];
}

function saveHistory() {
  sessionStorage.setItem('wordHistory', JSON.stringify(wordHistory));
}

function renderHistory() {
  const container = document.getElementById('history');
  if (!container) return;
  container.innerHTML = '';
  const limit = sessionLimit === Infinity ? wordHistory.length : sessionLimit;
  for (let i = 0; i < limit; i++) {
    const span = document.createElement('span');
    if (i < wordHistory.length) {
      span.className = 'history-emoji';
      span.textContent = wordHistory[i];
    } else {
      span.className = 'history-placeholder';
      span.textContent = '';
    }
    container.appendChild(span);
  }
}

function addToHistory(emoji) {
  wordHistory.push(emoji);
  if (wordHistory.length > 30) {
    wordHistory = wordHistory.slice(-30);
  }
  saveHistory();
  renderHistory();
}

async function loadWords() {
  // When the game is loaded from /game/index.html, the words JSON
  // lives in the sibling "data" directory. The previous relative
  // path used "../data" which incorrectly pointed one level above
  // the game folder, resulting in a 404 and an empty screen. Use the
  // correct relative path so the word list loads properly.
  const res = await fetch('data/words-fr.json');
  return res.json();
}

// Word playlist management
let wordList = [];
let playlist = [];
let playlistIndex = 0;
let previousWord = null;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function nextWord() {
  if (playlist.length === 0 || playlistIndex >= playlist.length) {
    playlist = [...wordList];
    shuffle(playlist);
    if (previousWord && playlist.length > 1) {
      // ensure the previously played word only appears after all others
      const prevIdx = playlist.findIndex((w) => w.word === previousWord.word);
      if (prevIdx !== -1) {
        const [prev] = playlist.splice(prevIdx, 1);
        playlist.push(prev);
      }
    }
    playlistIndex = 0;
  }
  const wordObj = playlist[playlistIndex];
  playlistIndex++;
  previousWord = wordObj;
  return wordObj;
}


function createSlots(word) {
  const container = document.getElementById('word');
  container.innerHTML = '';
  const slots = [];
  let previewIndices = [];
  if (previewMode === 'full') {
    previewIndices = [...word].map((_, idx) => idx);
  } else if (previewMode === 'partial') {
    previewIndices = [...word].map((_, idx) => idx);
    shuffle(previewIndices);
    previewIndices = previewIndices.slice(0, Math.ceil(word.length / 2));
  }
  for (const [idx, letter] of [...word].entries()) {
    const d = document.createElement('div');
    d.className = 'slot preview';
    d.dataset.letter = letter;
    d.textContent = previewIndices.includes(idx) ? letter : '?';
    container.appendChild(d);
    slots.push(d);
  }
  return slots;
}

function createTiles(word) {
  const container = document.getElementById('tiles');
  container.innerHTML = '';
  const letters = word.split('');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  while (letters.length < word.length + 5) {
    letters.push(alphabet[Math.floor(Math.random() * alphabet.length)]);
  }
  // simple shuffle
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  const tiles = [];
  for (const letter of letters) {
    const d = document.createElement('div');
    d.className = 'tile';
    d.textContent = letter;
    container.appendChild(d);
    tiles.push(d);
  }
  layoutTiles(tiles);
  tiles.forEach((d) => {
    d.style.opacity = 0;
    d.style.transform = 'scale(0)';
  });
  return tiles;
}

function animateTilesIn(tiles) {
  const order = [...tiles];
  shuffle(order);
  order.forEach((tile, idx) => {
    const delay = idx * 150;
    const anim = tile.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      { duration: 300, easing: 'ease-out', delay }
    );
    setTimeout(() => playBubble(), delay);
    anim.addEventListener('finish', () => {
      tile.style.opacity = 1;
      tile.style.transform = '';
      anim.cancel();
    });
  });
}

function startConfetti() {
  stopConfettiEffect = createConfettiEffect();
}

function stopConfetti() {
  if (stopConfettiEffect) {
    stopConfettiEffect();
    stopConfettiEffect = null;
  }
}

function startPictureAnimation() {
  const pic = document.getElementById('picture');
  bounceCount = 0;
  pic.classList.add('animate');
  bounceHandler = () => {
    bounceCount++;
    if (bounceCount % 10 === 0) {
      pic.animate([
        { transform: 'scale(1.3) rotate(0deg)' },
        { transform: 'scale(1.3) rotate(360deg)' }
      ], { duration: 400 });
    }
  };
  pic.addEventListener('animationiteration', bounceHandler);
}

function stopPictureAnimation() {
  const pic = document.getElementById('picture');
  pic.classList.remove('animate');
  if (bounceHandler) {
    pic.removeEventListener('animationiteration', bounceHandler);
    bounceHandler = null;
  }
}

function createBravoMessage() {
  const gradient = ['#FFA500', '#FF8A00', '#FF6F00', '#FF5400', '#FF3800', '#FF0000'];
  const text = 'BRAVO !';
  let colorIdx = 0;
  return text
    .split('')
    .map(ch => {
      if (ch === ' ') {
        return ' ';
      }
      const color = gradient[colorIdx++];
      return `<span style="color:${color}">${ch}</span>`;
    })
    .join('');
}

function celebrate() {
  const msg = document.getElementById('message');
  msg.innerHTML = createBravoMessage();
  msg.classList.add('show');
  startConfetti();
  startPictureAnimation();
  setTimeout(dropUnusedTiles, 400);
}

function dropUnusedTiles() {
  currentTiles.forEach((tile) => {
    if (tile.used) return;
    tile.classList.add('drop');
    tile.style.setProperty('--spin', `${Math.random() * 60 - 30}deg`);
    tile.style.setProperty('--duration', `${1.5 + Math.random()}s`);
    tile.style.setProperty('--delay', `${Math.random() * 0.5}s`);
    tile.addEventListener('animationend', () => tile.remove(), { once: true });
  });
}

function endGame() {
  // give the player a brief moment to enjoy the final word animation
  setTimeout(() => {
    document.body.classList.add('fade-out');
    setTimeout(() => {
      window.location.href = '../celebration/';
    }, 500);
  }, 1800);
}

async function animateWordReveal(slots) {
  const duration = 300;
  const delay = 200;
  const wordEl = document.getElementById('word');

  const animations = slots.map((slot, idx) =>
    slot
      .animate(
        [
          { transform: 'scale(1)' },
          { transform: 'scale(1.3)' },
          { transform: 'scale(1)' },
        ],
        { duration, easing: 'ease', delay: idx * delay }
      )
      .finished
  );
  await Promise.all(animations);

  const word = slots.map((s) => s.textContent).join('');
  const wordAnim = wordEl.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.3)' },
      { transform: 'scale(1)' },
    ],
    { duration, easing: 'ease' }
  );
  await Promise.all([playWord(word), wordAnim.finished]);
}

function showWord(wordObj, animateTiles = true) {
  const pic = document.getElementById('picture');
  pic.textContent = wordObj.emoji;
  pic.onpointerdown = () => {
    pic.animate(
      [
        { transform: 'scale(1)' },
        { transform: 'scale(1.3)' },
        { transform: 'scale(1)' },
      ],
      { duration: 300, easing: 'ease' }
    );
    playWord(wordObj.word);
  };
  const slots = createSlots(wordObj.word);
  const tiles = createTiles(wordObj.word);
  currentTiles = tiles;
  document.fonts.ready.then(handleResize);
  const nextBtn = document.getElementById('next');
  nextBtn.style.display = 'none';
  document.getElementById('message').classList.remove('show');
  stopConfetti();
  stopPictureAnimation();
  setupDragDrop(slots, tiles, () => {
      if (allSlotsFilled(slots)) {
        animateWordReveal(slots).then(() => {
          playSuccess();
          celebrate();
          addToHistory(wordObj.emoji);
          wordsPlayed++;
          if (sessionLimit !== Infinity && wordsPlayed >= sessionLimit) {
            endGame();
          } else {
            nextBtn.style.display = 'inline-block';
          }
        });
      }
    });
  nextBtn.textContent = 'Mot suivant \u27A1\uFE0F';
  nextBtn.onclick = () => {
    document.body.classList.add('word-fade-out');
    setTimeout(() => {
      document.body.classList.remove('word-fade-out');
      startGame();
      document.body.classList.add('word-fade-in');
      setTimeout(() => document.body.classList.remove('word-fade-in'), 200);
    }, 200);
  };
  if (animateTiles) {
    requestAnimationFrame(() => animateTilesIn(tiles));
  } else if (wordsPlayed > 0) {
    // When switching to the next word we skip the entrance animation to
    // avoid delay, but the tiles still need to be visible. Explicitly reset
    // the styles that `createTiles` uses to hide them so they appear
    // immediately.
    tiles.forEach((tile) => {
      tile.style.opacity = 1;
      tile.style.transform = '';
    });
  }
}

async function startGame() {
  if (wordList.length === 0) {
    wordList = await loadWords();
  }
  const word = nextWord();
  showWord(word, wordsPlayed === 0);
}

function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettings() {
  document.getElementById('settings-modal').classList.add('hidden');
}

async function handleFirstSelection(wordObj, btn) {
  btn.classList.add('selected');
  btn.parentElement.classList.add('selected');
  const overlay = document.getElementById('start-overlay');
  const startRect = btn.getBoundingClientRect();

  await ensureRunning();
  showWord(wordObj, false);
  previousWord = wordObj;

  // Hide game elements until transition completes
  const revealEls = [
    document.getElementById('picture'),
    document.getElementById('word'),
    document.getElementById('tiles'),
    document.getElementById('settings-btn'),
    document.getElementById('message'),
    document.getElementById('history'),
    document.getElementById('next'),
  ];
  revealEls.forEach((el) => {
    if (el) el.style.opacity = 0;
  });

  // Fade out other choices and title
  overlay.classList.add('selection-made');
  await new Promise((res) => setTimeout(res, 300));

  const picture = document.getElementById('picture');
  const endRect = picture.getBoundingClientRect();

  // Create flying emoji at original position
  const fly = document.createElement('span');
  fly.textContent = wordObj.emoji;
  fly.style.position = 'fixed';
  fly.style.left = `${startRect.left + startRect.width / 2}px`;
  fly.style.top = `${startRect.top + startRect.height / 2}px`;
  fly.style.transform = 'translate(-50%, -50%)';
  fly.style.fontSize = window.getComputedStyle(picture).fontSize;
  fly.style.zIndex = '10';
  document.body.appendChild(fly);
  btn.style.visibility = 'hidden';

  await fly
    .animate(
      [
        {
          left: `${startRect.left + startRect.width / 2}px`,
          top: `${startRect.top + startRect.height / 2}px`,
        },
        {
          left: `${endRect.left + endRect.width / 2}px`,
          top: `${endRect.top + endRect.height / 2}px`,
        },
      ],
      { duration: 300, easing: 'ease-in-out', fill: 'forwards' }
    )
    .finished;
  await new Promise((res) => setTimeout(res, 400));
  overlay.classList.add('hidden');

  // Reveal game elements
  revealEls.forEach((el) => {
    if (el) {
      el.style.transition = 'opacity 0.7s';
      el.style.opacity = 1;
    }
  });
  await new Promise((res) => setTimeout(res, 700));
  document.body.removeChild(fly);
  animateTilesIn(currentTiles);
}

function renderFirstWordOptions() {
  const container = document.getElementById('word-choices');
  if (!container) return;
  container.innerHTML = '';
  const shuffled = [...wordList];
  shuffle(shuffled);
  const options = shuffled.slice(0, 4);
  options.forEach((wordObj) => {
    const option = document.createElement('div');
    option.className = 'word-option';
    const btn = document.createElement('button');
    btn.className = 'word-btn';
    btn.textContent = wordObj.emoji;
    btn.addEventListener('click', () => handleFirstSelection(wordObj, btn));
    option.appendChild(btn);
    container.appendChild(option);
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  wordsPlayed = 0;
  sessionLimit = parseLimit(sessionStorage.getItem('wordLimit'));
  loadHistory();
  renderHistory();
  handleResize();
  document.fonts.ready.then(handleResize);

  wordList = await loadWords();
  const lengthSetting = localStorage.getItem('wordLength') || 'mixed';
  if (lengthSetting === 'short') {
    wordList = wordList.filter((w) => w.word.length <= 5);
  } else if (lengthSetting === 'long') {
    wordList = wordList.filter((w) => w.word.length >= 6);
  }
  renderFirstWordOptions();

  const settingsBtn = document.getElementById('settings-btn');
  const continueBtn = document.getElementById('continue-btn');
  const skipBtn = document.getElementById('skip-btn');
  const menuBtn = document.getElementById('menu-btn');
  const settingsModal = document.getElementById('settings-modal');

  settingsBtn.addEventListener('click', openSettings);
  continueBtn.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeSettings();
    }
  });
  skipBtn.addEventListener('click', () => {
    closeSettings();
    startGame();
  });
  menuBtn.addEventListener('click', () => {
    sessionStorage.removeItem('wordHistory');
    window.location.href = '../';
  });
  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);
});
