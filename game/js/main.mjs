import { setupDragDrop } from './drag-drop.mjs';
import { allSlotsFilled } from './word-check.mjs';
import { playSuccess } from './audio.mjs';

async function loadWords() {
  // When the game is loaded from /game/index.html, the words JSON
  // lives in the sibling "data" directory. The previous relative
  // path used "../data" which incorrectly pointed one level above
  // the game folder, resulting in a 404 and an empty screen. Use the
  // correct relative path so the word list loads properly.
  const res = await fetch('data/words-fr.json');
  return res.json();
}

function pickWord(words) {
  return words[Math.floor(Math.random() * words.length)];
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
  while (letters.length < word.length + 3) {
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
  const tileW = 40;
  const tileH = 50;
  const spacing = 10;

  const nonOverlappingPos = () => {
    for (let tries = 0; tries < 50; tries++) {
      const x = Math.random() * (width - tileW);
      const y = Math.random() * (height - tileH);
      let overlap = false;
      for (const p of positions) {
        if (Math.abs(p.x - x) < tileW + spacing && Math.abs(p.y - y) < tileH + spacing) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return { x, y };
    }
    return { x: Math.random() * (width - tileW), y: Math.random() * (height - tileH) };
  };

  for (const letter of letters) {
    const d = document.createElement('div');
    d.className = 'tile';
    d.textContent = letter;
    const pos = nonOverlappingPos();
    positions.push(pos);
    d.style.left = `${pos.x}px`;
    d.style.top = `${pos.y}px`;
    container.appendChild(d);
    tiles.push(d);
  }
  return tiles;
}

function celebrate() {
  const msg = document.getElementById('message');
  const confetti = document.getElementById('confetti');
  msg.textContent = 'Bravo !';
  msg.style.display = 'block';
  confetti.innerHTML = '';
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.className = 'confetti';
    span.textContent = '🎉';
    span.style.left = Math.random() * 100 + '%';
    confetti.appendChild(span);
  }
  setTimeout(() => {
    msg.style.display = 'none';
    confetti.innerHTML = '';
  }, 1500);
}

function showWord(wordObj) {
  document.getElementById('picture').textContent = wordObj.emoji;
  const slots = createSlots(wordObj.word);
  const tiles = createTiles(wordObj.word);
  const nextBtn = document.getElementById('next');
  nextBtn.style.display = 'none';
  document.getElementById('message').style.display = 'none';
  document.getElementById('confetti').innerHTML = '';
  setupDragDrop(slots, tiles, () => {
    if (allSlotsFilled(slots)) {
      playSuccess();
      celebrate();
      nextBtn.style.display = 'inline-block';
    }
  });
  nextBtn.onclick = () => startGame();
}

let wordList = [];

async function startGame() {
  if (wordList.length === 0) {
    wordList = await loadWords();
  }
  const word = pickWord(wordList);
  showWord(word);
}

window.addEventListener('DOMContentLoaded', startGame);
