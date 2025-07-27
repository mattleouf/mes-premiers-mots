window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.count, 10);
      sessionStorage.setItem('wordLimit', String(count));
      window.location.href = '../game/';
    });
  });
  document.getElementById('back').addEventListener('click', () => {
    window.location.href = '../';
  });
});
