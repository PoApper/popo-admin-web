import { PERIOD, buildPeriodQuery } from '@/utils/reservation-period';

export const EMPTY_PLACE_FILTER = {
  placeId: '',
  status: '',
  startDate: '',
  endDate: '',
  title: '',
  order: 'createdAt_DESC',
};

export const EMPTY_EQUIP_FILTER = {
  owner: '',
  status: '',
  startDate: '',
  endDate: '',
  title: '',
  order: 'createdAt_DESC',
};

/**
 * 대기 목록은 항상 심사중만 본다.
 *
 * 정렬 기본값은 생성일 오래된순이다. 예약 승인은 '먼저 신청한 사람이 먼저'가 원칙인데,
 * 예약일 순으로 늘어놓으면 같은 날짜끼리 묶여서 신청 순서와 무관하게 처리하게 된다.
 */
export const emptyWaitingFilter = (resourceName) => ({
  [resourceName]: '',
  period: PERIOD.upcoming,
  title: '',
  order: 'createdAt_ASC',
});

/**
 * 화면의 필터 상태를 백엔드 쿼리 파라미터로 변환한다.
 * 날짜 input 은 'YYYY-MM-DD' 를 주지만 백엔드는 'YYYYMMDD' 를 기대한다.
 */
export function buildQueryParams(filter) {
  const [orderBy, orderDirection] = filter.order.split('_');
  const params = { orderBy, orderDirection };

  if (filter.placeId) params.placeId = filter.placeId;
  if (filter.owner) params.owner = filter.owner;
  if (filter.status) params.status = filter.status;
  if (filter.title) params.title = filter.title;
  if (filter.startDate) params.startDate = filter.startDate.replaceAll('-', '');
  if (filter.endDate) params.endDate = filter.endDate.replaceAll('-', '');

  // 기간 프리셋은 startDate/endDate 로 풀어서 보낸다.
  // 직접 지정한 날짜가 있으면 그쪽을 우선한다.
  if (filter.period) {
    const periodQuery = buildPeriodQuery(filter.period);
    if (periodQuery.startDate && !params.startDate) {
      params.startDate = periodQuery.startDate;
    }
    if (periodQuery.endDate && !params.endDate) {
      params.endDate = periodQuery.endDate;
    }
  }

  return params;
}
