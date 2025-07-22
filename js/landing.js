// Landing page interactions
window.addEventListener('DOMContentLoaded', () => {
  // Reset word history when returning to the start screen
  sessionStorage.removeItem('wordHistory');
  const play = document.getElementById('play');
  const options = document.getElementById('options');
  const tiles = Array.from(document.querySelectorAll('.flying-tile'));

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const size = 60; // match CSS

  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  // Slightly faster movement than before
  const randomVelocity = () =>
    (Math.random() * 0.4 + 0.2) * 1.2 * (Math.random() < 0.5 ? -1 : 1);

  const states = [];

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

  tiles.forEach((tile) => {
    const pos = nonOverlappingPosition();
    tile.textContent = randomLetter();
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
        tiles[idx].textContent = randomLetter();
      }
      if (s.y <= 0 || s.y >= maxY) {
        s.vy *= -1;
        s.y = Math.max(0, Math.min(s.y, maxY));
        tiles[idx].textContent = randomLetter();
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

  play.addEventListener('click', () => {
    window.location.href = 'game/';
  });
  options.addEventListener('click', () => {
    window.location.href = 'settings/';
  });
});
