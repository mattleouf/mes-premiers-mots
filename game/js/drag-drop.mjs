import { playSuccess, playError } from './audio.mjs';

export function setupDragDrop(slots, tiles, onComplete) {
  const isComplete = () => slots.every((s) => s.classList.contains('filled'));
  let current;
  let outerTarget;

  const intersectingSlot = (tile) => {
    const t = tile.getBoundingClientRect();
    return slots.find((slot) => {
      const r = slot.getBoundingClientRect();
      const expandedTop = r.top - r.height * 0.25;
      const expandedBottom = r.bottom + r.height * 0.25;
      return (
        t.right > r.left &&
        t.left < r.right &&
        t.bottom > expandedTop &&
        t.top < expandedBottom
      );
    });
  };

  const inOuterHitbox = (tile, slot) => {
    const t = tile.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    const marginX = r.width * 0.15; // 30% larger overall
    const marginY = r.height * 0.15;
    return (
      t.right > r.left - marginX &&
      t.left < r.right + marginX &&
      t.bottom > r.top - marginY &&
      t.top < r.bottom + marginY
    );
  };

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.style.touchAction = 'none';
    let startX, startY;

    const move = (e) => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      tile.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

      const over = intersectingSlot(tile);
      if (over !== current) {
        if (current) {
          current.classList.remove('hover');
          outerTarget = current; // activate outer hitbox for previous slot
        }
        if (over && !over.classList.contains('filled')) {
          over.classList.add('hover');
          outerTarget = null; // inner hover takes priority
        }
        current = over;
      }
    };

    const clearHover = () => {
      if (current) {
        current.classList.remove('hover');
        outerTarget = current;
        current = null;
      }
    };

    const end = (e) => {
      tile.removeEventListener('pointermove', move);
      tile.removeEventListener('pointerup', end);
      tile.removeEventListener('pointercancel', end);
      // Ensure the tile position reflects the final pointer location.
      // Fast drags may not fire a last pointermove, so manually update
      // using the pointerup coordinates before evaluating the drop.
      move(e);
      tile.releasePointerCapture(e.pointerId);
      let dropSlot = intersectingSlot(tile);
      if (!dropSlot && outerTarget && !outerTarget.classList.contains('filled') && inOuterHitbox(tile, outerTarget)) {
        dropSlot = outerTarget;
      }
      tile.style.transition = 'transform 0.2s';
      tile.style.transform = '';
      clearHover();
      outerTarget = null;
      let wrongDrop = false;
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
        } else {
          wrongDrop = true;
          dropSlot.classList.add('wrong', 'flash-letter');
          playError();
          dropSlot.addEventListener('animationend', () => {
            dropSlot.classList.remove('wrong');
            dropSlot.classList.remove('flash-letter');
          }, { once: true });
          tile.addEventListener('animationend', () => tile.classList.remove('shake'), { once: true });
        }
      }
      tile.addEventListener('transitionend', () => {
        tile.style.transition = '';
        if (wrongDrop) {
          tile.classList.add('shake');
        }
      }, { once: true });
      tile.classList.remove('active');
    };

    tile.addEventListener('pointerdown', (e) => {
      if (tile.used) return;
      startX = e.clientX;
      startY = e.clientY;
      outerTarget = null;
      tile.setPointerCapture(e.pointerId);
      tile.classList.add('active');
      tile.addEventListener('pointermove', move);
      tile.addEventListener('pointerup', end);
      tile.addEventListener('pointercancel', end);
    });
  });
}
