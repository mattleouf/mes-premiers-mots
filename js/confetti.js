// Canvas-based confetti effect inspired by https://github.com/dcousens/particles
// Exports a startConfetti function that attaches a full screen canvas
// and animates colorful falling particles. Returns a stop function.

const COLORS = [
  [85, 71, 106],
  [174, 61, 99],
  [219, 56, 83],
  [244, 92, 68],
  [248, 182, 70],
];
const PI2 = Math.PI * 2;
const NUM_CONFETTI = 200;

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
      this.size = Math.random() * 6 + 4;
      this.replace();
    }
    replace() {
      this.opacity = 0;
      this.dop = 0.03 * (Math.random() * 3 + 1);
      this.x = Math.random() * w;
      this.y = Math.random() * h - 20;
      this.xmax = w;
      this.ymax = h;
      this.vx = Math.random() * 6 - 3;
      this.vy = Math.random() * 3 + 2;
      this.rotation = Math.random() * PI2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.2;
      this.shape = Math.random() < 0.5 ? 'rect' : 'circle';
    }
    draw() {
      this.x += this.vx;
      this.y += this.vy; // falling downwards
      this.rotation += this.rotationSpeed;
      this.opacity += this.dop;
      if (this.opacity > 1) {
        this.opacity = 1;
        this.dop *= -1;
      }
      if (this.opacity < 0 || this.y > this.ymax) this.replace();
      if (this.x > this.xmax || this.x < 0) {
        this.x = (this.x + this.xmax) % this.xmax;
      }
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.rotation);
      context.fillStyle = `${this.rgb},${this.opacity})`;
      if (this.shape === 'rect') {
        context.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.4);
      } else {
        context.beginPath();
        context.arc(0, 0, this.size / 2, 0, PI2);
        context.fill();
      }
      context.restore();
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
