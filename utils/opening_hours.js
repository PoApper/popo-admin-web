export const KoreanWeekday = {
  Monday: '월',
  Tuesday: '화',
  Wednesday: '수',
  Thursday: '목',
  Friday: '금',
  Saturday: '토',
  Sunday: '일',
  Everyday: '매일',
};

export function isOnOpeningHours(
  openingHours,
  weekday, // Monday
  startTime, // hh:mm
  endTime, // hh:mm
) {
  const openingHour = JSON.parse(openingHours);

  if (openingHour['Everyday']) {
    weekday = 'Everyday';
  }
  const hours = openingHour[weekday].split(',');

  for (const hour of hours) {
    const openStart = hour.split('-')[0];
    const openEnd = hour.split('-')[1];

    // 하나라도 range 내부에 포함된다면 예약 가능
    const isInside = openStart <= startTime && endTime <= openEnd;
    if (isInside) {
      return true;
    }
  }

  return false;
}
