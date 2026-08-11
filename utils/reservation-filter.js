import { PERIOD, buildPeriodQuery } from '@/utils/reservation-period';

export const EMPTY_PLACE_FILTER = {
  placeId: '',
  status: '',
  startDate: '',
  endDate: '',
  title: '',
  order: 'createdAt_DESC',
};

/** 대기 목록은 항상 심사중이고, 예약일이 임박한 순서가 중요하다. */
export const emptyWaitingFilter = (resourceName) => ({
  [resourceName]: '',
  period: PERIOD.upcoming,
  title: '',
  order: 'date_ASC',
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
