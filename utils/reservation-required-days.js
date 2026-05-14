export function normalizeReservationRequiredDays(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
