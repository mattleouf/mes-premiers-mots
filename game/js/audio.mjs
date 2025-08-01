let ctx;

function getContext() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return ctx;
}

export function playSuccess() {
  try {
    const audioCtx = getContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 880;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
    o.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.log('Success!');
  }
}

export function playError() {
  try {
    const audioCtx = getContext();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'square';
    o.frequency.value = 220;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
    o.stop(audioCtx.currentTime + 0.4);
  } catch (e) {
    console.log('Error!');
  }
}

// Cache letter audio elements so each file is loaded once and reused.
// Using HTMLAudioElement playback allows us to debounce per letter by
// simply ignoring play requests while the audio is already playing.
const letterCache = {};

export function playLetter(letter) {
  const upper = letter.toUpperCase();
  try {
    let audio = letterCache[upper];
    if (!audio) {
      const url = new URL(`../../assets/audio/alphabet/FR/${upper}.mp3`, import.meta.url);
      audio = new Audio(url.href);
      letterCache[upper] = audio;
    }
    if (!audio.paused) return; // debounce: don't overlap same letter audio
    audio.currentTime = 0;
    audio.play().catch(() => {});
  } catch (e) {
    console.log('Letter', upper);
  }
}
