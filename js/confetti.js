// Canvas-based confetti effect inspired by https://github.com/dcousens/particles
// Exports a startConfetti function that attaches a full screen canvas
// and animates colorful falling particles. Returns a stop function.

const COLORS = [
  [85, 71, 106],
  [174, 61, 99],
  [219, 56, 83],
  [244, 92, 68],
  [248, 182, 70]
];
const PI2 = Math.PI * 2;
const NUM_CONFETTI = 150;

export function startConfetti(container = document.body) {
  const canvas = document.createElement('canvas');
  canvas.id = 'confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  container.appendChild(canvas);
  const context = canvas.getContext('2d');

  let w = 0;
  let h = 0;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  let xpos = 0.5;
  window.addEventListener('mousemove', (e) => {
    xpos = e.clientX / w;
  });

  class Confetto {
    constructor() {
      this.style = COLORS[(Math.random() * COLORS.length) | 0];
      this.rgb = `rgba(${this.style[0]},${this.style[1]},${this.style[2]}`;
      this.r = (Math.random() * 4 + 2) | 0;
      this.r2 = this.r * 2;
      this.replace();
    }
    replace() {
      this.opacity = 0;
      this.dop = 0.03 * (Math.random() * 3 + 1);
      this.x = Math.random() * (w - this.r2);
      this.y = Math.random() * (h - this.r2) - 20;
      this.xmax = w - this.r;
      this.ymax = h - this.r;
      this.vx = Math.random() * 2 + 8 * xpos - 5;
      this.vy = 0.7 * this.r + Math.random() * 2 - 1;
    }
    draw() {
      this.x += this.vx;
      this.y += this.vy;
      this.opacity += this.dop;
      if (this.opacity > 1) {
        this.opacity = 1;
        this.dop *= -1;
      }
      if (this.opacity < 0 || this.y > this.ymax) this.replace();
      if (!(0 < this.x && this.x < this.xmax)) {
        this.x = (this.x + this.xmax) % this.xmax;
      }
      context.beginPath();
      context.arc(this.x | 0, this.y | 0, this.r, 0, PI2, false);
      context.fillStyle = `${this.rgb},${this.opacity})`;
      context.fill();
    }
  }

  const confetti = Array.from({ length: NUM_CONFETTI }, () => new Confetto());

  let animationFrame;
  function step() {
    context.clearRect(0, 0, w, h);
    confetti.forEach((c) => c.draw());
    animationFrame = requestAnimationFrame(step);
  }
  step();

  return function stop() {
    cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', resize);
    container.removeChild(canvas);
  };
}
