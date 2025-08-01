// Cache letter audio elements so each file is loaded once and reused.
// Each playback explicitly resets the element so the requested letter
// always plays, even if the same letter is triggered rapidly.
const letterCache = {};

export async function playLetter(letter) {
  const upper = letter.toUpperCase();
  try {
    let audio = letterCache[upper];
    if (!audio) {
      const url = new URL(`../../assets/audio/alphabet/FR/${upper}.mp3`, import.meta.url);
      audio = new Audio(url.href);
      letterCache[upper] = audio;
    }
    // Always restart playback so the letter audio is heard every time.
    audio.pause();
    audio.currentTime = 0;
    await audio.play().catch(() => {});
  } catch (e) {
    console.log('Letter', upper);
  }
}

// This module intentionally only exposes the letter audio. All other
// feedback sounds have been removed for a quieter gameplay experience.
