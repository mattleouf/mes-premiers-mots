// Play letter pronunciations using simple HTMLAudioElements. Each
// letter's audio element is cached and rewound to the start on every
// playback.
const letterCache = {};

export async function playLetter(letter) {
  const upper = letter.toUpperCase();
  try {
    let audio = letterCache[upper];
    if (!audio) {
      const url = new URL(`../../assets/audio/alphabet/FR/${upper}.mp3`, import.meta.url);
      audio = new Audio(url);
      letterCache[upper] = audio;
    }
    audio.currentTime = 0;
    await audio.play();
  } catch (e) {
    console.log('Letter', upper);
  }
}

// This module intentionally only exposes the letter audio. All other
// feedback sounds have been removed for a quieter gameplay experience.
