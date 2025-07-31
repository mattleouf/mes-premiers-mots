window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('wordLength');
  const saved = localStorage.getItem('wordLength') || 'mixed';
  select.value = saved;
  select.addEventListener('change', () => {
    localStorage.setItem('wordLength', select.value);
  });

  const backBtn = document.getElementById('back');
  backBtn.addEventListener('click', () => {
    window.location.href = '../';
  });
});
