// Use the shared confetti script from the project root.
import { startConfetti } from '../../js/confetti.js';
import { playBravo } from '../../game/js/audio.mjs';

window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('emoji-container');
  const menuBtn = document.getElementById('menu');
  const thumbUp = document.getElementById('thumb-up');
  const wheel = document.getElementById('wheel');
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
  const trophies = new Set();
  const GRAVITY = 800; // px/s^2
  let lastTime = null;

  function spawnTrophy() {
    const trophy = document.createElement('span');
    trophy.textContent = '🏆';
    trophy.className = 'trophy';
    trophy.x = 0;
    trophy.y = 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 200 + Math.random() * 200;
    trophy.vx = Math.cos(angle) * speed;
    trophy.vy = Math.sin(angle) * speed;
    wheel.appendChild(trophy);
    trophies.add(trophy);
    if (lastTime === null) {
      lastTime = performance.now();
      requestAnimationFrame(updateTrophies);
    }
  }

  function updateTrophies(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;
    trophies.forEach((t) => {
      t.vy += GRAVITY * dt;
      t.x += t.vx * dt;
      t.y += t.vy * dt;
      t.style.transform = `translate(-50%, -50%) translate(${t.x}px, ${t.y}px)`;
      if (t.y > wheel.clientHeight / 2 + 100) {
        t.remove();
        trophies.delete(t);
      }
    });
    if (trophies.size) {
      requestAnimationFrame(updateTrophies);
    } else {
      lastTime = null;
    }
  }

  thumbUp.addEventListener('pointerdown', spawnTrophy);
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
