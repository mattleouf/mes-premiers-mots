// DOM-based confetti effect inspired by https://codepen.io/wakana-k/pen/gOqqWdY
// Exports startConfetti which returns a stop function.

const COLORS = ['#fce18a', '#ff726d', '#b48def', '#f4306d'];
const INTERVAL = 150;

export function startConfetti(container = document.body) {
  ensureStyles();
  const wrapper = document.createElement('div');
  wrapper.className = 'wk-confetti';
  container.appendChild(wrapper);

  function addPiece() {
    const piece = document.createElement('span');
    piece.className = 'wk-confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.setProperty('--color', COLORS[Math.floor(Math.random() * COLORS.length)]);
    piece.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
    piece.style.setProperty('--rotate', (Math.random() < 0.5 ? '-' : '') + '720deg');
    piece.style.setProperty('--duration', 4 + Math.random() * 2 + 's');
    wrapper.appendChild(piece);
    piece.addEventListener('animationend', () => piece.remove());
  }

  for (let i = 0; i < 20; i++) addPiece();
  const timer = setInterval(addPiece, INTERVAL);

  return function stop() {
    clearInterval(timer);
    wrapper.remove();
  };
}

function ensureStyles() {
  if (document.getElementById('wk-confetti-style')) return;
  const style = document.createElement('style');
  style.id = 'wk-confetti-style';
  style.textContent = `
    .wk-confetti { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
    .wk-confetti-piece {
      position: absolute;
      top: -10px;
      width: 10px;
      height: 10px;
      background-color: var(--color);
      opacity: 0.9;
      transform: rotate(45deg);
      animation: wk-confetti-fall var(--duration) linear forwards;
    }
    @keyframes wk-confetti-fall {
      0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateX(var(--sway)) translateY(100vh) rotate(var(--rotate)); opacity: 0; }
    }
  `;
  document.head.appendChild(style);
}
