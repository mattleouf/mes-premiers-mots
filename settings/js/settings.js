window.addEventListener('DOMContentLoaded', () => {
  const setupSelect = (id, storageKey, defaultValue) => {
    const select = document.getElementById(id);
    const saved = localStorage.getItem(storageKey) || defaultValue;
    select.value = saved;

    const showLongOptions = () => {
      Array.from(select.options).forEach((opt) => {
        if (opt.dataset.long) {
          opt.textContent = opt.dataset.long;
        }
      });
    };

    const setPreview = () => {
      showLongOptions();
      const selected = select.selectedOptions[0];
      if (selected && selected.dataset.short) {
        selected.textContent = selected.dataset.short;
      }
    };

    select.addEventListener('focus', showLongOptions);
    select.addEventListener('change', () => {
      localStorage.setItem(storageKey, select.value);
      setPreview();
    });
    select.addEventListener('blur', setPreview);

    setPreview();
  };

  setupSelect('wordLength', 'wordLength', 'mixed');
  setupSelect('previewMode', 'previewMode', 'full');

  const backBtn = document.getElementById('back');
  backBtn.addEventListener('click', () => {
    window.location.href = '../';
  });
});
