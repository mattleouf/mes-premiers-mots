// Landing page interactions
window.addEventListener('DOMContentLoaded', () => {
  const play = document.getElementById('play');
  const options = document.getElementById('options');
  const tiles = Array.from(document.querySelectorAll('.flying-tile'));

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const size = 60; // match CSS

  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  const randomVelocity = () => (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1);

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
    for (const s of states) {
      s.x += s.vx;
      s.y += s.vy;

      if (s.x <= 0 || s.x >= maxX) {
        s.vx *= -1;
        s.x = Math.max(0, Math.min(s.x, maxX));
      }
      if (s.y <= 0 || s.y >= maxY) {
        s.vy *= -1;
        s.y = Math.max(0, Math.min(s.y, maxY));
      }
    }

    // collisions between tiles
    for (let i = 0; i < states.length; i++) {
      for (let j = i + 1; j < states.length; j++) {
        const a = states[i];
        const b = states[j];
        if (Math.abs(a.x - b.x) < size && Math.abs(a.y - b.y) < size) {
          const tmpVx = a.vx;
          const tmpVy = a.vy;
          a.vx = b.vx;
          a.vy = b.vy;
          b.vx = tmpVx;
          b.vy = tmpVy;

          const overlapX = size - Math.abs(a.x - b.x);
          const overlapY = size - Math.abs(a.y - b.y);
          if (overlapX > 0) {
            if (a.x < b.x) {
              a.x -= overlapX / 2;
              b.x += overlapX / 2;
            } else {
              a.x += overlapX / 2;
              b.x -= overlapX / 2;
            }
          }
          if (overlapY > 0) {
            if (a.y < b.y) {
              a.y -= overlapY / 2;
              b.y += overlapY / 2;
            } else {
              a.y += overlapY / 2;
              b.y -= overlapY / 2;
            }
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
