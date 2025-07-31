window.addEventListener('DOMContentLoaded', () => {
  const radios = document.querySelectorAll('input[name="wordLength"]');
  const saved = localStorage.getItem('wordLength') || 'mixed';
  radios.forEach((radio) => {
    if (radio.value === saved) {
      radio.checked = true;
    }
    radio.addEventListener('change', () => {
      localStorage.setItem('wordLength', radio.value);
    });
  });

  const backBtn = document.getElementById('back');
  backBtn.addEventListener('click', () => {
    window.location.href = '../';
  });
});
