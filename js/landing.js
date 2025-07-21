// Landing page interactions
window.addEventListener('DOMContentLoaded', () => {
  const play = document.getElementById('play');
  const options = document.getElementById('options');
  const tile = document.getElementById('flying-tile');

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const size = 60; // match CSS
  let x = Math.random() * (window.innerWidth - size);
  let y = Math.random() * (window.innerHeight - size);
  let vx = (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1);
  let vy = (Math.random() * 0.4 + 0.2) * (Math.random() < 0.5 ? -1 : 1);

  const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
  tile.textContent = randomLetter();
  tile.style.transform = `translate(${x}px, ${y}px)`;

  const step = () => {
    x += vx;
    y += vy;

    const maxX = window.innerWidth - size;
    const maxY = window.innerHeight - size;

    if (x <= 0 || x >= maxX) {
      vx *= -1;
      x = Math.max(0, Math.min(x, maxX));
      tile.textContent = randomLetter();
    }
    if (y <= 0 || y >= maxY) {
      vy *= -1;
      y = Math.max(0, Math.min(y, maxY));
      tile.textContent = randomLetter();
    }

    tile.style.transform = `translate(${x}px, ${y}px)`;
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
