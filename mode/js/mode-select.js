window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    const countAttr = btn.dataset.count;
    const preview = btn.nextElementSibling;
    if (preview && preview.classList.contains('preview')) {
      preview.textContent = btn.dataset.emoji || '';
    }
    btn.addEventListener('click', () => {
      sessionStorage.setItem('wordLimit', countAttr);
      window.location.href = '../game/';
    });
  });
  document.getElementById('back').addEventListener('click', () => {
    window.location.href = '../';
  });
});
