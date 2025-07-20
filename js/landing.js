// Landing page interactions
window.addEventListener('DOMContentLoaded', () => {
  const play = document.getElementById('play');
  const options = document.getElementById('options');
  play.addEventListener('click', () => {
    window.location.href = 'game/';
  });
  options.addEventListener('click', () => {
    window.location.href = 'settings/';
  });
});
