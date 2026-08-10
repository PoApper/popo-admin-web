import { useCallback, useEffect, useState } from 'react';
import { Dropdown, Pagination, Tab } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import ReservationLayout from '@/components/reservation/reservation.layout';
import PlaceReservationWaitTable from '@/components/place/place.reservation.wait.table';
import EquipmentReservationWaitTable from '@/components/equipment/equipment.reservation.wait.table';
import {
  PERIOD,
  PERIOD_OPTIONS,
  buildPeriodQuery,
} from '@/utils/reservation-period';

const PAGE_SIZE = 20;
const WAITING_STATUS = '심사중';

/**
 * 심사중 예약 한 종류(장소 또는 장비)를 기간 필터 + 페이지네이션으로 조회하는 훅.
 *
 * 예전에는 심사중인 모든 예약을 한 번에 받아왔는데, 운영 환경에서 수천 건이 쌓이면서
 * 페이지가 매우 느려졌다. 이제 서버 페이지네이션을 쓰고 기본적으로 다가오는 예약만 본다.
 */
function useWaitingReservations(resource) {
  const [reservations, setReservations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [period, setPeriod] = useState(PERIOD.upcoming);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = useCallback(async () => {
    setIsLoading(true);
    const params = {
      status: WAITING_STATUS,
      // 승인 여부를 판단할 때는 예약이 임박한 순서가 중요하다.
      orderBy: 'date',
      orderDirection: 'ASC',
      ...buildPeriodQuery(period),
    };

    try {
      const [listRes, countRes] = await Promise.all([
        PoPoAxios.get(`/${resource}`, {
          params: { ...params, take: PAGE_SIZE, skip: PAGE_SIZE * (page - 1) },
        }),
        PoPoAxios.get(`/${resource}/count`, { params: params }),
      ]);
      setReservations(listRes.data);
      setTotalCount(countRes.data);
    } catch (err) {
      console.log(err);
      alert('예약 대기 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [resource, period, page]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const changePeriod = (newPeriod) => {
    setPage(1);
    setPeriod(newPeriod);
  };

  return {
    reservations,
    totalCount,
    page,
    setPage,
    period,
    changePeriod,
    isLoading,
  };
}

const WaitingReservationPane = ({ label, state, children }) => {
  const { totalCount, page, setPage, period, changePeriod, isLoading } = state;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        <span>기간</span>
        <Dropdown
          selection
          compact
          options={PERIOD_OPTIONS}
          value={period}
          onChange={(e, target) => changePeriod(target.value)}
        />
        <span>
          {isLoading
            ? '로딩중...'
            : `${label} ${Number(totalCount).toLocaleString()}건 대기중`}
          {!isLoading && totalCount > 0 && ` (${page}/${totalPages} 페이지)`}
        </span>
      </div>

      {period === PERIOD.upcoming && (
        <p style={{ color: 'gray' }}>
          이미 종료된 예약은 기본적으로 숨겨져 있습니다. 확인이 필요하면 기간을
          &quot;지난 예약&quot;으로 바꿔주세요.
        </p>
      )}

      {isLoading ? <p>로딩 중...</p> : children}

      {totalPages > 1 && (
        <div style={{ display: 'flex' }}>
          <Pagination
            style={{ margin: '0 auto' }}
            activePage={page}
            totalPages={totalPages}
            prevItem={null}
            nextItem={null}
            onPageChange={(e, target) => setPage(target.activePage)}
          />
        </div>
      )}
    </div>
  );
};

const ReservationPage = ({
  totalPlaceReservationCnt,
  todayPlaceReservationCnt,
  thisWeekPlaceReservationCnt,
  totalEquipReservationCnt,
  todayEquipReservationCnt,
  thisWeekEquipReservationCnt,
}) => {
  const placeState = useWaitingReservations('reservation-place');
  const equipState = useWaitingReservations('reservation-equip');

  return (
    <ReservationLayout>
      <h3>예약 대기 목록</h3>
      <ul style={{ padding: '0 0 0 20px' }}>
        <li>
          총 장소 예약 수: {Number(totalPlaceReservationCnt).toLocaleString()}건
        </li>
        <li>
          오늘 장소 예약 수: {Number(todayPlaceReservationCnt).toLocaleString()}
          건
        </li>
        <li>
          이번 주 장소 예약 수:{' '}
          {Number(thisWeekPlaceReservationCnt).toLocaleString()}건
        </li>
      </ul>
      <ul style={{ padding: '0 0 0 20px' }}>
        <li>
          총 장비 예약 수: {Number(totalEquipReservationCnt).toLocaleString()}건
        </li>
        <li>
          오늘 장비 예약 수: {Number(todayEquipReservationCnt).toLocaleString()}
          건
        </li>
        <li>
          이번 주 장비 예약 수:{' '}
          {Number(thisWeekEquipReservationCnt).toLocaleString()}건
        </li>
      </ul>
      <p>
        <b>심사중</b>인 예약이 예약일이 임박한 순서로 표시됩니다. 예약 제목을
        누르면 상세 예약 정보를 확인할 수 있습니다.
      </p>
      <p>
        예약 종료 시간이 현재 시간을 지났다면{' '}
        <span style={{ color: 'red' }}>빨간색</span>으로 표시됩니다.
      </p>

      <Tab
        panes={[
          {
            menuItem: '장소 예약',
            render: () => (
              <WaitingReservationPane label="장소 예약" state={placeState}>
                {placeState.reservations.length ? (
                  <PlaceReservationWaitTable
                    reservations={placeState.reservations}
                    startIdx={(placeState.page - 1) * PAGE_SIZE}
                  />
                ) : (
                  <p>조건에 맞는 대기 중인 장소 예약이 없습니다 🎈</p>
                )}
              </WaitingReservationPane>
            ),
          },
          {
            menuItem: '장비 예약',
            render: () => (
              <WaitingReservationPane label="장비 예약" state={equipState}>
                {equipState.reservations.length ? (
                  <EquipmentReservationWaitTable
                    reservations={equipState.reservations}
                    startIdx={(equipState.page - 1) * PAGE_SIZE}
                  />
                ) : (
                  <p>조건에 맞는 대기 중인 장비 예약이 없습니다 🎈</p>
                )}
              </WaitingReservationPane>
            ),
          },
        ]}
      />
    </ReservationLayout>
  );
};

export default ReservationPage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('statistics/reservation/place/count');
  const placeReservationCntStats = res1.data;

  const res2 = await PoPoAxios.get('statistics/reservation/equipment/count');
  const equipReservationCntStats = res2.data;

  return {
    props: {
      totalPlaceReservationCnt: placeReservationCntStats.totalReservationCnt,
      todayPlaceReservationCnt: placeReservationCntStats.todayReservationCnt,
      thisWeekPlaceReservationCnt:
        placeReservationCntStats.thisWeekReservationCnt,
      totalEquipReservationCnt: equipReservationCntStats.totalReservationCnt,
      todayEquipReservationCnt: equipReservationCntStats.todayReservationCnt,
      thisWeekEquipReservationCnt:
        equipReservationCntStats.thisWeekReservationCnt,
    },
  };
}
