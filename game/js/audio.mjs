// Play letter pronunciations using the Web Audio API. Letter clips are
// decoded into an AudioBuffer and a fresh AudioBufferSourceNode is
// created for each playback so repeated letters work reliably across
// browsers, including iOS.

// Lazy-create the audio context so it's only built after a user gesture.
let ctx;
function audioCtx() {
  return ctx ??= new (window.AudioContext || window.webkitAudioContext)();
}

/* ---- 1. unlock on any gesture Safari/WebView understands ---- */
['pointerdown', 'touchstart', 'click'].forEach(type =>
  window.addEventListener(type, () => audioCtx().resume(), { once: true })
);

/* ---- 2. helper that guarantees the context is running ---- */
export async function ensureRunning() {
  const c = audioCtx();
  if (c.state !== 'running') await c.resume(); // await is vital
}

/* ---- 3. play audio clips ---- */
const cache = {};

export async function playLetter(letter) {
  await ensureRunning(); // must finish before start()
  const upper = letter.toUpperCase();
  let buf = cache[upper];
  if (!buf) {
    const url = new URL(
      `../../assets/audio/alphabet/FR/${upper}.mp3`,
      import.meta.url
    );
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const bytes = await res.arrayBuffer();
    buf = cache[upper] = await audioCtx().decodeAudioData(bytes);
  }
  const src = audioCtx().createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx().destination);
  src.start();
}

export async function playWord(word) {
  await ensureRunning();
  const upper = word.toUpperCase();
  const file = upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const key = `WORD:${file}`;
  let buf = cache[key];
  if (!buf) {
    const url = new URL(
      `../../assets/audio/words/FR/${file}.mp3`,
      import.meta.url
    );
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const bytes = await res.arrayBuffer();
    buf = cache[key] = await audioCtx().decodeAudioData(bytes);
  }
  const src = audioCtx().createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx().destination);
  src.start();
  return new Promise((res) => src.addEventListener('ended', res, { once: true }));
}

export async function playSuccess() {
  await ensureRunning();
  const key = 'SFX:SUCCESS';
  let buf = cache[key];
  if (!buf) {
    const url = new URL(
      '../../assets/audio/SFX/SUCCESS.mp3',
      import.meta.url
    );
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const bytes = await res.arrayBuffer();
    buf = cache[key] = await audioCtx().decodeAudioData(bytes);
  }
  const src = audioCtx().createBufferSource();
  src.buffer = buf;
  src.connect(audioCtx().destination);
  src.start();
  return new Promise((res) => src.addEventListener('ended', res, { once: true }));
}

// This module intentionally only exposes the letter, word, and success audio.
