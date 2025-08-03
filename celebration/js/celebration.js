// Use the shared confetti script from the project root.
import { startConfetti } from '../../js/confetti.js';
import { playBravo } from '../../game/js/audio.mjs';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('emoji-container');
  const menuBtn = document.getElementById('menu');
  const stored = sessionStorage.getItem('wordHistory');
  const emojis = stored ? JSON.parse(stored) : [];

  const stopConfetti = startConfetti();

  // Attempt to play the celebration audio immediately; if the browser
  // blocks autoplay (e.g. due to missing user interaction), retry after
  // the first pointer/touch/click event.
  playBravo().catch(() => {
    const retry = () => {
      playBravo();
      ['pointerdown', 'touchstart', 'click'].forEach((t) =>
        window.removeEventListener(t, retry)
      );
    };
    ['pointerdown', 'touchstart', 'click'].forEach((t) =>
      window.addEventListener(t, retry, { once: true })
    );
  });

  const wrappers = [];
  const radius = 35; // circle radius in vmin
  const baseSize = Math.min(8, 60 / Math.max(emojis.length, 1));
  const fontSize = baseSize * 1.25; // make emojis 25% larger

  emojis.forEach((e, idx) => {
    const wrapper = document.createElement('span');
    wrapper.className = 'emoji-wrapper';
    const angle = (360 / emojis.length) * idx;
    wrapper.style.setProperty('--angle', `${angle}deg`);
    wrapper.style.setProperty('--radius', `${radius}vmin`);

    const span = document.createElement('span');
    span.className = 'emoji';
    span.textContent = e;
    span.style.fontSize = `clamp(3.75rem, ${fontSize}vmin, 10rem)`;

    wrapper.appendChild(span);
    container.appendChild(wrapper);
    wrappers.push(span);
  });

  const spinDuration = 600;
  const overlap = 0.5; // start next spin when current is 50% done
  function wave(i = 0) {
    if (!wrappers.length) return;
    const el = wrappers[i];
    el.classList.add('spin');
    setTimeout(() => el.classList.remove('spin'), spinDuration);
    setTimeout(() => wave((i + 1) % wrappers.length), spinDuration * overlap);
  }

  wave();

  menuBtn.addEventListener('click', () => {
    sessionStorage.removeItem('wordLimit');
    sessionStorage.removeItem('wordHistory');
    stopConfetti();
    window.location.href = '../';
  });

  window.addEventListener('pagehide', stopConfetti);
});
