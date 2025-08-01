// Play letter pronunciations using the Web Audio API. Letter clips are
// decoded into an AudioBuffer and a fresh AudioBufferSourceNode is
// created for each playback so repeated letters work reliably across
// browsers, including iOS.
const ctx = new (window.AudioContext || window.webkitAudioContext)();

// Resume the audio context on the first user gesture to satisfy iOS
// autoplay restrictions.
function unlock() {
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}
window.addEventListener('pointerdown', unlock, { once: true });

const letterCache = {};

export async function playLetter(letter) {
  const upper = letter.toUpperCase();
  try {
    let buffer = letterCache[upper];
    if (!buffer) {
      const url = new URL(`../../assets/audio/alphabet/FR/${upper}.mp3`, import.meta.url);
      const res = await fetch(url);
      const arrayBuf = await res.arrayBuffer();
      buffer = await ctx.decodeAudioData(arrayBuf);
      letterCache[upper] = buffer;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    console.log('Letter', upper);
  }
}

// This module intentionally only exposes the letter audio. All other
// feedback sounds have been removed for a quieter gameplay experience.
