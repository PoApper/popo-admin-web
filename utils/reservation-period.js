import moment from 'moment';

/**
 * 예약 대기 목록을 "다가오는 예약 / 지난 예약"으로 나누기 위한 도우미.
 *
 * 심사중 예약이 수천 건 쌓이면 전부 한 번에 보여줄 수 없고, 이미 시간이 지난 예약은
 * 승인해도 의미가 없어 평소에는 볼 필요가 없다. 다만 확인할 방법을 남겨야 하므로
 * 기본값은 "다가오는 예약"이고, 토글로 지난 예약도 볼 수 있게 한다.
 */

export const PERIOD = {
  upcoming: 'upcoming',
  past: 'past',
  all: 'all',
};

export const PERIOD_OPTIONS = [
  { key: PERIOD.upcoming, value: PERIOD.upcoming, text: '다가오는 예약' },
  { key: PERIOD.past, value: PERIOD.past, text: '지난 예약' },
  { key: PERIOD.all, value: PERIOD.all, text: '전체' },
];

function todayString() {
  return moment().format('YYYYMMDD');
}

function yesterdayString() {
  return moment().subtract(1, 'day').format('YYYYMMDD');
}

/**
 * 기간 구분을 백엔드의 startDate/endDate 쿼리로 변환한다.
 *
 * 경계는 "날짜" 단위다. 오늘 날짜의 예약은 이미 끝난 것이라도 "다가오는 예약"에 포함되는데,
 * 오늘 건은 관리자가 확인해야 하는 대상이므로 이 편이 안전하다.
 */
export function buildPeriodQuery(period) {
  if (period === PERIOD.upcoming) {
    return { startDate: todayString() };
  }
  if (period === PERIOD.past) {
    return { endDate: yesterdayString() };
  }
  return {};
}

/**
 * 예약의 종료 시각이 이미 지났는지 판단한다.
 * 종료 시각 '0000' 은 자정을 의미하므로 다음 날 00:00 으로 취급한다.
 */
export function isReservationOutdated(reservation, now = moment()) {
  const endDatetime =
    reservation.endTime === '0000'
      ? moment(reservation.date, 'YYYYMMDD').add(1, 'day').startOf('day')
      : moment(`${reservation.date} ${reservation.endTime}`, 'YYYYMMDD HHmm');

  return now.isAfter(endDatetime);
}
