import React, { useCallback, useEffect, useState } from 'react';
import { Button, Pagination } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import PlaceReservationTable from '@/components/place/place.reservation.table';
import PlaceReservationFilter from '@/components/place/place.reservation.filter';
import { PoPoAxios } from '@/utils/axios.instance';

const PAGE_SIZE = 10;

const EMPTY_FILTER = {
  placeId: '',
  status: '',
  startDate: '',
  endDate: '',
  title: '',
  order: 'createdAt_DESC',
};

/**
 * 화면의 필터 상태를 백엔드 쿼리 파라미터로 변환한다.
 * 날짜 input 은 'YYYY-MM-DD' 를 주지만 백엔드는 'YYYYMMDD' 를 기대한다.
 */
function buildQueryParams(filter) {
  const [orderBy, orderDirection] = filter.order.split('_');

  const params = { orderBy, orderDirection };

  if (filter.placeId) params.placeId = filter.placeId;
  if (filter.status) params.status = filter.status;
  if (filter.title) params.title = filter.title;
  if (filter.startDate) params.startDate = filter.startDate.replaceAll('-', '');
  if (filter.endDate) params.endDate = filter.endDate.replaceAll('-', '');

  return params;
}

const PlaceReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [places, setPlaces] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 입력 중인 필터와 실제로 조회에 적용된 필터를 분리해, 검색 버튼을 누를 때만 조회한다.
  const [filter, setFilter] = useState(EMPTY_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(EMPTY_FILTER);

  const fetchReservations = useCallback(async (targetFilter, targetPage) => {
    const params = buildQueryParams(targetFilter);

    try {
      const [listRes, countRes] = await Promise.all([
        PoPoAxios.get('/reservation-place', {
          params: {
            ...params,
            take: PAGE_SIZE,
            skip: PAGE_SIZE * (targetPage - 1),
          },
        }),
        PoPoAxios.get('/reservation-place/count', { params: params }),
      ]);

      setReservations(listRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      alert('장소 예약 목록을 불러오는데 실패했습니다.');
      console.log(err);
    }
  }, []);

  useEffect(() => {
    PoPoAxios.get('/place')
      .then((res) => setPlaces(res.data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
    fetchReservations(appliedFilter, page);
  }, [fetchReservations, appliedFilter, page]);

  const handleSearch = () => {
    setPage(1);
    setAppliedFilter(filter);
  };

  const handleReset = () => {
    setPage(1);
    setFilter(EMPTY_FILTER);
    setAppliedFilter(EMPTY_FILTER);
  };

  const handlePageChange = (e, target) => {
    setPage(target.activePage);
  };

  return (
    <ReservationLayout>
      <h3>장소 예약 목록</h3>
      <p>
        장소·상태·예약일·제목으로 예약을 걸러낼 수 있습니다.
        <br />
        예약 내용을 수정하는 건 <b>불가능</b>합니다. 예약 승인/거절/삭제만
        가능합니다.
      </p>
      <p>
        <Button href={'/place/reservation/create'}>
          장소 예약 생성 (관리자)
        </Button>
      </p>

      <PlaceReservationFilter
        filter={filter}
        places={places}
        onChange={setFilter}
        onSubmit={handleSearch}
        onReset={handleReset}
      />

      <div>
        <p>검색 결과: 총 {Number(totalCount).toLocaleString()}건</p>
        {reservations.length ? (
          <PlaceReservationTable
            reservations={reservations}
            startIdx={(page - 1) * PAGE_SIZE}
          />
        ) : (
          <p>조건에 맞는 장소 예약이 없습니다 🎈</p>
        )}
        <div style={{ display: 'flex' }}>
          <Pagination
            style={{ margin: '0 auto' }}
            activePage={page}
            totalPages={Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
            prevItem={null}
            nextItem={null}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </ReservationLayout>
  );
};

export default PlaceReservationPage;
