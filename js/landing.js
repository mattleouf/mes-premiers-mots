// Landing page interactions
window.addEventListener('DOMContentLoaded', async () => {
  // Reset word history when returning to the start screen
  sessionStorage.removeItem('wordHistory');
  const play = document.getElementById('play');
  const options = document.getElementById('options');
  const overlay = document.getElementById('loading-overlay');
  const progressBar = document.getElementById('loading-progress');
  const progressText = document.getElementById('loading-text');
  const tiles = Array.from(document.querySelectorAll('.flying-tile'));

  const size = 90; // match CSS

  const wordData = await fetch('game/data/words-fr.json').then((r) => r.json());
  const emojis = wordData.map((w) => w.emoji);

  const randomEmoji = () => emojis[Math.floor(Math.random() * emojis.length)];
  // Slightly faster movement than before
  const randomVelocity = () =>
    (Math.random() * 0.4 + 0.2) * 1.2 * (Math.random() < 0.5 ? -1 : 1);

  const states = [];

  const resources = [
    'mode/index.html',
    'mode/css/mode.css',
    'mode/js/mode-select.js',
    'game/index.html',
    'game/css/game.css',
    'game/js/main.mjs',
    'game/js/drag-drop.mjs',
    'game/js/word-check.mjs',
    'game/js/audio.mjs',
    'game/data/words-fr.json',
    'settings/index.html',
    'settings/css/settings.css',
    'settings/js/settings.js',
    'celebration/index.html',
    'celebration/css/celebration.css',
    'celebration/js/celebration.js',
    'js/confetti.js'
  ];

  async function prefetchResources() {
    overlay.classList.remove('hidden');
    let loaded = 0;
    for (const url of resources) {
      try {
        await fetch(url);
      } catch (e) {
        // ignore failures (offline or 404)
      }
      loaded++;
      const pct = Math.round((loaded / resources.length) * 100);
      progressBar.style.width = pct + '%';
      progressText.textContent = pct + '%';
    }
    overlay.classList.add('hidden');
  }

  const nonOverlappingPosition = () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      const x = Math.random() * (window.innerWidth - size);
      const y = Math.random() * (window.innerHeight - size);
      let overlap = false;
      for (const s of states) {
        if (Math.abs(s.x - x) < size && Math.abs(s.y - y) < size) {
          overlap = true;
          break;
        }
      }
      if (!overlap) return { x, y };
    }
    return { x: Math.random() * (window.innerWidth - size), y: Math.random() * (window.innerHeight - size) };
  };

  const uniqueEmojis = [...emojis]
    .sort(() => Math.random() - 0.5)
    .slice(0, tiles.length);

  tiles.forEach((tile, idx) => {
    const pos = nonOverlappingPosition();
    tile.textContent = uniqueEmojis[idx];
    tile.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    states.push({
      x: pos.x,
      y: pos.y,
      vx: randomVelocity(),
      vy: randomVelocity(),
    });
  });

  const step = () => {
    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;

    // move and bounce on edges
    states.forEach((s, idx) => {
      s.x += s.vx;
      s.y += s.vy;

      if (s.x <= 0 || s.x >= maxX) {
        s.vx *= -1;
        s.x = Math.max(0, Math.min(s.x, maxX));
        tiles[idx].textContent = randomEmoji();
      }
      if (s.y <= 0 || s.y >= maxY) {
        s.vy *= -1;
        s.y = Math.max(0, Math.min(s.y, maxY));
        tiles[idx].textContent = randomEmoji();
      }
    });

    // collisions between tiles (simple elastic swap)
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const a = states[i];
        const b = states[j];
        if (Math.abs(a.x - b.x) < size && Math.abs(a.y - b.y) < size) {
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          if (Math.abs(dx) > Math.abs(dy)) {
            const overlap = size - Math.abs(dx);
            if (dx > 0) {
              a.x += overlap / 2;
              b.x -= overlap / 2;
            } else {
              a.x -= overlap / 2;
              b.x += overlap / 2;
            }
            const tmp = a.vx;
            a.vx = b.vx;
            b.vx = tmp;
          } else {
            const overlap = size - Math.abs(dy);
            if (dy > 0) {
              a.y += overlap / 2;
              b.y -= overlap / 2;
            } else {
              a.y -= overlap / 2;
              b.y += overlap / 2;
            }
            const tmp = a.vy;
            a.vy = b.vy;
            b.vy = tmp;
          }
        }
      }
    }

    tiles.forEach((tile, i) => {
      const s = states[i];
      tile.style.transform = `translate(${s.x}px, ${s.y}px)`;
    });

    requestAnimationFrame(step);
  };

  requestAnimationFrame(step);

  if (!localStorage.getItem('prefetched')) {
    await prefetchResources();
    localStorage.setItem('prefetched', '1');
  } else {
    overlay.classList.add('hidden');
  }

  play.addEventListener('click', () => {
    window.location.href = 'mode/';
  });
  options.addEventListener('click', () => {
    window.location.href = 'settings/';
  });
});
