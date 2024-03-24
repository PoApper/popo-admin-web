import moment from 'moment';

// dt: YYYMMDD
export function convertDate(dt) {
  return moment(dt, 'YYYYMMDD').format('YYYY년 MM월 DD일');
}

// time: HHmm
export function convertTime(time) {
  return moment(time, 'HHmm').format('HH:mm');
}

export function hourDiff(startTime, endTime) {
  const startMoment = moment(startTime, 'HHmm');
  const endMoment = moment(endTime, 'HHmm');
  const duration = moment.duration(endMoment.diff(startMoment));

  return duration.asHours();
}

export function roundUpByDuration(date, durationMinutes = 30) {
  const remainder = durationMinutes - (date.minute() % durationMinutes);
  return moment(date).add(remainder, 'minutes').second(0);
}

export function convertStatus(status) {
  switch (status) {
    case '통과':
      return 'green';
    case '거절':
      return 'red';
    default:
      return 'black';
  }
}
