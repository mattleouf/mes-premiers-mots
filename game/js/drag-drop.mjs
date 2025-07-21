export function setupDragDrop(slots, tiles, onComplete) {
  const isComplete = () => slots.every((s) => s.classList.contains('filled'));

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.style.touchAction = 'none';
    let startX, startY;

    const move = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      tile.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const end = (e) => {
      tile.removeEventListener('pointermove', move);
      tile.removeEventListener('pointerup', end);
      tile.removeEventListener('pointercancel', end);
      tile.releasePointerCapture(e.pointerId);
      tile.style.transform = '';

      const dropSlot = slots.find((slot) => {
        const r = slot.getBoundingClientRect();
        return (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        );
      });

      if (dropSlot && !dropSlot.textContent) {
        const letter = tile.textContent;
        if (letter === dropSlot.dataset.letter) {
          dropSlot.textContent = letter;
          dropSlot.classList.add('filled');
          dropSlot.classList.remove('preview');
          tile.used = true;
          tile.style.visibility = 'hidden';
          if (isComplete()) {
            onComplete();
          }
        }
      }
    };

    tile.addEventListener('pointerdown', (e) => {
      if (tile.used) return;
      startX = e.clientX;
      startY = e.clientY;
      tile.setPointerCapture(e.pointerId);
      tile.addEventListener('pointermove', move);
      tile.addEventListener('pointerup', end);
      tile.addEventListener('pointercancel', end);
    });
  });
}
