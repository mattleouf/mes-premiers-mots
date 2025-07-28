window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('emoji-container');
  const menuBtn = document.getElementById('menu');
  const stored = sessionStorage.getItem('wordHistory');
  const emojis = stored ? JSON.parse(stored) : [];

  emojis.forEach((e) => {
    const span = document.createElement('span');
    span.className = 'emoji';
    span.textContent = e;
    container.appendChild(span);
  });

  menuBtn.addEventListener('click', () => {
    sessionStorage.removeItem('wordLimit');
    sessionStorage.removeItem('wordHistory');
    window.location.href = '../';
  });
});
