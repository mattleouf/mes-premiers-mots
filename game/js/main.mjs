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
  for (const letter of letters) {
    const d = document.createElement('div');
    d.className = 'tile';
    d.textContent = letter;
    container.appendChild(d);
    tiles.push(d);
  }
  return tiles;
}

function showWord(wordObj) {
  document.getElementById('picture').textContent = wordObj.emoji;
  const slots = createSlots(wordObj.word);
  const tiles = createTiles(wordObj.word);
  const nextBtn = document.getElementById('next');
  nextBtn.style.display = 'none';
  setupDragDrop(slots, tiles, () => {
    if (allSlotsFilled(slots)) {
      playSuccess();
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
