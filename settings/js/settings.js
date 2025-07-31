window.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('wordLength');
  const saved = localStorage.getItem('wordLength') || 'mixed';
  select.value = saved;

  const showLongOptions = () => {
    Array.from(select.options).forEach((opt) => {
      opt.textContent = opt.dataset.long;
    });
  };

  const setPreview = () => {
    showLongOptions();
    const selected = select.selectedOptions[0];
    if (selected) {
      selected.textContent = selected.dataset.short;
    }
  };

  select.addEventListener('focus', showLongOptions);
  select.addEventListener('change', () => {
    localStorage.setItem('wordLength', select.value);
    setPreview();
  });
  select.addEventListener('blur', setPreview);

  setPreview();

  const backBtn = document.getElementById('back');
  backBtn.addEventListener('click', () => {
    window.location.href = '../';
  });
});
