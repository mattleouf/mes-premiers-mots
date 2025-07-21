export function setupDragDrop(slots, tiles, onComplete) {
  tiles.forEach((tile) => {
    tile.draggable = true;
    tile.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', tile.textContent);
    });
  });

  slots.forEach((slot) => {
    slot.addEventListener('dragover', (e) => e.preventDefault());
    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      if (slot.textContent) return;
      const letter = e.dataTransfer.getData('text/plain');
      if (letter === slot.dataset.letter) {
        slot.textContent = letter;
        slot.classList.add('filled');
        const tile = tiles.find((t) => t.textContent === letter && !t.used);
        if (tile) {
          tile.used = true;
          tile.style.visibility = 'hidden';
        }
        if (slots.every((s) => s.classList.contains('filled'))) {
          onComplete();
        }
      }
    });
  });
}
