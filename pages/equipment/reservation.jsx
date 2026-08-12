import React, { useCallback, useEffect, useState } from 'react';
import { Pagination } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import EquipmentReservationTable from '@/components/equipment/equipment.reservation.table';
import ReservationFilter from '@/components/reservation/reservation.filter';
import { OwnerOptions } from '@/assets/owner.options';
import { PoPoAxios } from '@/utils/axios.instance';
import {
  EMPTY_EQUIP_FILTER,
  buildQueryParams,
} from '@/utils/reservation-filter';

const PAGE_SIZE = 10;

const EquipmentReservationPage = () => {
  const [reservations, setReservations] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // 입력 중인 필터와 실제로 조회에 적용된 필터를 분리해, 검색 버튼을 누를 때만 조회한다.
  const [filter, setFilter] = useState(EMPTY_EQUIP_FILTER);
  const [appliedFilter, setAppliedFilter] = useState(EMPTY_EQUIP_FILTER);

  const fetchReservations = useCallback(async (targetFilter, targetPage) => {
    const params = buildQueryParams(targetFilter);

    try {
      const [listRes, countRes] = await Promise.all([
        PoPoAxios.get('/reservation-equip', {
          params: {
            ...params,
            take: PAGE_SIZE,
            skip: PAGE_SIZE * (targetPage - 1),
          },
        }),
        PoPoAxios.get('/reservation-equip/count', { params: params }),
      ]);

      setReservations(listRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      alert('장비 예약 목록을 불러오는데 실패했습니다.');
      console.log(err);
    }
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
    setFilter(EMPTY_EQUIP_FILTER);
    setAppliedFilter(EMPTY_EQUIP_FILTER);
  };

  const handlePageChange = (e, target) => {
    setPage(target.activePage);
  };

  return (
    <ReservationLayout>
      <h3>장비 예약 목록</h3>
      <p>
        소유 기관·상태·예약일·제목으로 예약을 걸러낼 수 있습니다.
        <br />
        예약 내용을 수정하는 건 <b>불가능</b>합니다. 예약 승인/거절/삭제만
        가능합니다.
      </p>

      <ReservationFilter
        filter={filter}
        onChange={setFilter}
        onSubmit={handleSearch}
        onReset={handleReset}
        resource={{
          name: 'owner',
          label: '소유 기관',
          options: OwnerOptions,
        }}
      />

      <div>
        <p>검색 결과: 총 {Number(totalCount).toLocaleString()}건</p>
        {reservations.length ? (
          <EquipmentReservationTable
            reservations={reservations}
            startIdx={(page - 1) * PAGE_SIZE}
          />
        ) : (
          <p>조건에 맞는 장비 예약이 없습니다 🎈</p>
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

export default EquipmentReservationPage;
