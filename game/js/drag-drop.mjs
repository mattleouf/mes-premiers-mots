import { playSuccess } from './audio.mjs';

export function setupDragDrop(slots, tiles, onComplete) {
  const isComplete = () => slots.every((s) => s.classList.contains('filled'));
  let current;

  const intersectingSlot = (tile) => {
    const t = tile.getBoundingClientRect();
    return slots.find((slot) => {
      const r = slot.getBoundingClientRect();
      return (
        t.right > r.left &&
        t.left < r.right &&
        t.bottom > r.top &&
        t.top < r.bottom
      );
    });
  };

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.style.touchAction = 'none';
    let startX, startY;

    const move = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      tile.style.transform = `translate(${dx}px, ${dy}px)`;

      const over = intersectingSlot(tile);
      if (over !== current) {
        if (current) current.classList.remove('hover');
        if (over && !over.classList.contains('filled')) over.classList.add('hover');
        current = over;
      }
    };

    const clearHover = () => {
      if (current) {
        current.classList.remove('hover');
        current = null;
      }
    };

    const end = (e) => {
      tile.removeEventListener('pointermove', move);
      tile.removeEventListener('pointerup', end);
      tile.removeEventListener('pointercancel', end);
      tile.releasePointerCapture(e.pointerId);
      const dropSlot = intersectingSlot(tile);
      tile.style.transform = '';
      clearHover();

        if (dropSlot && !dropSlot.classList.contains('filled')) {
          const letter = tile.textContent;
          if (letter === dropSlot.dataset.letter) {
            dropSlot.textContent = letter;
            dropSlot.classList.add('filled', 'placed');
            dropSlot.classList.remove('preview');
            tile.used = true;
            tile.style.visibility = 'hidden';
            playSuccess();
            dropSlot.addEventListener('animationend', () => dropSlot.classList.remove('placed'), { once: true });
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
