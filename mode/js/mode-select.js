window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    const countAttr = btn.dataset.count;
    const preview = btn.parentElement.querySelector('.preview');
    if (preview) {
      preview.textContent = btn.dataset.emoji || '';
    }
    btn.addEventListener('click', () => {
      sessionStorage.setItem('wordLimit', countAttr);
      btn.classList.add('selected');
      setTimeout(() => {
        window.location.href = '../game/';
      }, 300);
    });
  });
  document.getElementById('back').addEventListener('click', () => {
    window.location.href = '../';
  });
});
