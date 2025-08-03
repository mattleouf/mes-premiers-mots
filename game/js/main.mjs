import { setupDragDrop } from './drag-drop.mjs';
import { allSlotsFilled } from './word-check.mjs';
import { startConfetti as createConfettiEffect } from '../../js/confetti.js';
import { ensureRunning, playWord } from './audio.mjs';

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

function repositionTiles() {
  const container = document.getElementById('tiles');
  if (!container) return;
  const { width, height } = container.getBoundingClientRect();
  const sampleSlot = document.querySelector('.slot');
  const slotRect = sampleSlot
    ? sampleSlot.getBoundingClientRect()
    : { width: 40, height: 50 };
  const tileW = slotRect.width;
  const tileH = slotRect.height;
  const marginX = tileW;
  // use a smaller vertical margin so random placement always has
  // some wiggle room even on short screens
  const marginY = Math.min(tileH * 0.5, height * 0.1);
  const positions = [];
  const maxAttempts = 300;

  const randomPos = () => ({
    x: marginX + Math.random() * Math.max(0, width - 2 * marginX - tileW),
    y: marginY + Math.random() * Math.max(0, height - 2 * marginY - tileH),
  });

  const isOverlap = (x, y) =>
    positions.some((p) =>
      !(x + tileW <= p.x || p.x + tileW <= x || y + tileH <= p.y || p.y + tileH <= y)
    );

  const nonOverlappingPos = () => {
    for (let tries = 0; tries < maxAttempts; tries++) {
      const pos = randomPos();
      if (!isOverlap(pos.x, pos.y)) return pos;
    }
    return randomPos();
  };

  currentTiles.forEach((tile) => {
    if (tile.used) return;
    const pos = nonOverlappingPos();
    positions.push(pos);
    tile.style.left = `${pos.x}px`;
    tile.style.top = `${pos.y}px`;
  });
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
    if (
      previousWord &&
      playlist.length > 1 &&
      playlist[0].word === previousWord.word
    ) {
      // ensure we don't repeat the same word twice in a row
      const swapIdx = playlist.findIndex((w) => w.word !== previousWord.word);
      if (swapIdx > 0) {
        [playlist[0], playlist[swapIdx]] = [playlist[swapIdx], playlist[0]];
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
  for (const letter of word) {
    const d = document.createElement('div');
    d.className = 'slot preview';
    d.dataset.letter = letter;
    d.textContent = letter;
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
  const positions = [];
  const { width, height } = container.getBoundingClientRect();

  // Measure an existing slot to get the actual tile dimensions as rendered by
  // CSS. This avoids relying on custom property strings like
  // "clamp(40px, 10vw, 80px)" which cannot be parsed directly to pixel values.
  const sampleSlot = document.querySelector('.slot');
  const slotRect = sampleSlot
    ? sampleSlot.getBoundingClientRect()
    : { width: 40, height: 50 };
  const tileW = slotRect.width;
  const tileH = slotRect.height;
  const spacing = tileW * 0.25;
  const marginX = tileW; // keep one tile empty on each side
  // vertical margin kept small so available height isn't consumed
  const marginY = Math.min(tileH * 0.5, height * 0.1);

  const maxAttempts = 300;

  const randomPos = () => ({
    x: marginX + Math.random() * Math.max(0, width - 2 * marginX - tileW),
    y: marginY + Math.random() * Math.max(0, height - 2 * marginY - tileH)
  });

  const isOverlap = (x, y) =>
    positions.some((p) =>
      !(x + tileW <= p.x || p.x + tileW <= x || y + tileH <= p.y || p.y + tileH <= y)
    );

  const nonOverlappingPos = () => {
    for (let tries = 0; tries < maxAttempts; tries++) {
      const pos = randomPos();
      if (!isOverlap(pos.x, pos.y)) return pos;
    }
    return randomPos();
  };

  for (const letter of letters) {
    const d = document.createElement('div');
    d.className = 'tile';
    d.textContent = letter;
    const pos = nonOverlappingPos();
    positions.push(pos);
    d.style.left = `${pos.x}px`;
    d.style.top = `${pos.y}px`;
    d.style.opacity = 0;
    d.style.transform = 'scale(0)';
    container.appendChild(d);
    tiles.push(d);
  }
  return tiles;
}

function animateTilesIn(tiles) {
  const order = [...tiles];
  shuffle(order);
  order.forEach((tile, idx) => {
    const anim = tile.animate(
      [
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.2)', opacity: 1 },
        { transform: 'scale(1)', opacity: 1 }
      ],
      { duration: 300, easing: 'ease-out', delay: idx * 150 }
    );
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
  playWord(word);
  await wordAnim.finished;
}

function showWord(wordObj, animateTiles = true) {
  document.getElementById('picture').textContent = wordObj.emoji;
  const slots = createSlots(wordObj.word);
  const tiles = createTiles(wordObj.word);
  currentTiles = tiles;
  document.fonts.ready.then(repositionTiles);
  const nextBtn = document.getElementById('next');
  nextBtn.style.display = 'none';
  document.getElementById('message').classList.remove('show');
  stopConfetti();
  stopPictureAnimation();
  setupDragDrop(slots, tiles, () => {
      if (allSlotsFilled(slots)) {
        animateWordReveal(slots).then(() => {
          addToHistory(wordObj.emoji);
          celebrate();
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
  repositionTiles();
  document.fonts.ready.then(repositionTiles);

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
  window.addEventListener('resize', repositionTiles);
});
