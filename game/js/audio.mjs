// Use the Web Audio API so letter pronunciations play reliably across
// browsers. Each letter is fetched and decoded once, then an
// AudioBufferSourceNode is created for every playback. This avoids
// "first play" issues seen on Safari and Chromium where HTMLAudio
// elements sometimes fail to start or cut off.
const ctx = new (window.AudioContext || window.webkitAudioContext)();
const letterCache = {};

async function loadBuffer(letter) {
  const url = new URL(`../../assets/audio/alphabet/FR/${letter}.mp3`, import.meta.url);
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  // Safari still uses the callback form for decodeAudioData, while newer
  // browsers return a Promise. Support both signatures.
  if (ctx.decodeAudioData.length === 1) {
    return ctx.decodeAudioData(arrayBuffer);
  }
  return new Promise((resolve, reject) => {
    ctx.decodeAudioData(arrayBuffer, resolve, reject);
  });
}

export async function playLetter(letter) {
  const upper = letter.toUpperCase();
  try {
    let buffer = letterCache[upper];
    if (!buffer) {
      buffer = await loadBuffer(upper);
      letterCache[upper] = buffer;
    }
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch (e) {
    console.log('Letter', upper);
  }
}

// This module intentionally only exposes the letter audio. All other
// feedback sounds have been removed for a quieter gameplay experience.
