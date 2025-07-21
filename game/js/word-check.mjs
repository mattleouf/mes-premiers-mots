export function allSlotsFilled(slots) {
  return slots.every((s) => s.classList.contains('filled'));
}
