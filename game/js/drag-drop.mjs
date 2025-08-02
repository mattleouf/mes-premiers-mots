import { playLetter } from './audio.mjs';

export function setupDragDrop(slots, tiles, onComplete) {
  const isComplete = () => slots.every((s) => s.classList.contains('filled'));
  let current;
  let outerTarget;
  let activeTile = null;
  let startX, startY;

  const startEvents = window.PointerEvent
    ? ['pointerdown']
    : ['mousedown', 'touchstart'];
  const moveEvents = window.PointerEvent
    ? ['pointermove']
    : ['mousemove', 'touchmove'];
  const endEvents = window.PointerEvent
    ? ['pointerup', 'pointercancel']
    : ['mouseup', 'touchend', 'touchcancel'];

  const getPoint = (e) =>
    e.touches?.[0] || e.changedTouches?.[0] || e;

  const intersectingSlot = (tile) => {
    const t = tile.getBoundingClientRect();
    return slots.find((slot) => {
      if (slot.classList.contains('filled')) return false;
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

  const move = (e) => {
    if (!activeTile) return;
    const p = getPoint(e);
    const dx = p.clientX - startX;
    const dy = p.clientY - startY;
    activeTile.style.transform = `translate(${dx}px, ${dy}px) scale(1.1)`;

    const over = intersectingSlot(activeTile);
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
    if (!activeTile) return;
    moveEvents.forEach((ev) => document.removeEventListener(ev, move));
    endEvents.forEach((ev) => document.removeEventListener(ev, end));
    // Ensure the tile position reflects the final pointer location.
    // Fast drags may not fire a last pointermove, so manually update
    // using the pointerup coordinates before evaluating the drop.
    move(e);
    const tile = activeTile;
    activeTile = null;
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
        // Announce the locked-in letter immediately upon correct placement.
        playLetter(letter);
        dropSlot.addEventListener('animationend', () => dropSlot.classList.remove('placed'), { once: true });
        if (isComplete()) {
          onComplete();
        }
      } else {
        wrongDrop = true;
        dropSlot.classList.add('wrong', 'flash-letter');
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

  const startDrag = (tile, e) => {
    if (tile.used || activeTile) return;
    activeTile = tile;
    const p = getPoint(e);
    startX = p.clientX;
    startY = p.clientY;
    outerTarget = null;
    tile.classList.add('active');
    if (e.pointerId !== undefined && tile.setPointerCapture) {
      tile.setPointerCapture(e.pointerId);
    }
    moveEvents.forEach((ev) => document.addEventListener(ev, move, { passive: false }));
    endEvents.forEach((ev) => document.addEventListener(ev, end));
  };

  tiles.forEach((tile) => {
    tile.draggable = false;
    tile.style.touchAction = 'none';
    startEvents.forEach((type) => {
      tile.addEventListener(
        type,
        (e) => {
          e.stopPropagation();
          e.preventDefault();
          startDrag(tile, e);
        },
        { passive: false }
      );
    });
  });

  const container = document.getElementById('tiles');
  startEvents.forEach((type) => {
    container.addEventListener(
      type,
      (e) => {
        if (e.target.classList.contains('tile')) return;
        const p = getPoint(e);
        const x = p.clientX;
        const y = p.clientY;
        let candidate = null;
        let bestDist = Infinity;
        tiles.forEach((tile) => {
          if (tile.used) return;
          const r = tile.getBoundingClientRect();
          const marginX = r.width * 0.25; // expand width 50%
          const marginY = r.height * 0.25;
          if (
            x >= r.left - marginX &&
            x <= r.right + marginX &&
            y >= r.top - marginY &&
            y <= r.bottom + marginY
          ) {
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            const dist = Math.hypot(x - cx, y - cy);
            if (dist < bestDist) {
              bestDist = dist;
              candidate = tile;
            }
          }
        });
        if (candidate) {
          startDrag(candidate, e);
        }
      },
      { passive: false }
    );
  });
}
