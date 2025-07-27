window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    const count = parseInt(btn.dataset.count, 10);
    const preview = btn.querySelector('.preview');
    if (preview) {
      for (let i = 0; i < count; i++) {
        const span = document.createElement('span');
        span.className = 'preview-slot';
        preview.appendChild(span);
      }
    }
    btn.addEventListener('click', () => {
      sessionStorage.setItem('wordLimit', String(count));
      window.location.href = '../game/';
    });
  });
  document.getElementById('back').addEventListener('click', () => {
    window.location.href = '../';
  });
});
