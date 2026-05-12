export function normalizeReservationRequiredDays(value) {
  return Math.max(0, Number(value) || 0);
}
