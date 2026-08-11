import { useCallback, useEffect, useState } from 'react';
import { Tab } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import ReservationLayout from '@/components/reservation/reservation.layout';
import ReservationFilter from '@/components/reservation/reservation.filter';
import PlaceReservationWaitTable from '@/components/place/place.reservation.wait.table';
import EquipmentReservationWaitTable from '@/components/equipment/equipment.reservation.wait.table';
import { OwnerOptions } from '@/assets/owner.options';
import { PERIOD } from '@/utils/reservation-period';
import {
  buildQueryParams,
  emptyWaitingFilter,
} from '@/utils/reservation-filter';

const WAITING_STATUS = '심사중';
const WAITING_FILTER_FIELDS = ['resource', 'period', 'order', 'title'];

/**
 * 심사중 예약 한 종류(장소 또는 장비)를 필터 조건으로 한 번에 조회한다.
 *
 * 페이지를 나누면 일괄 승인/거절 대상이 현재 페이지로 쪼개져 오히려 불편해서,
 * 목록은 한 번에 전부 보여준다. 대신 기본 기간을 "다가오는 예약"으로 두어
 * 이미 끝난 예약 수천 건을 통째로 불러오지 않게 한다.
 */
function useWaitingReservations(resource, resourceName) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 입력 중인 필터와 실제 조회에 적용된 필터를 분리해, 검색 버튼을 누를 때만 조회한다.
  const [filter, setFilter] = useState(() => emptyWaitingFilter(resourceName));
  const [appliedFilter, setAppliedFilter] = useState(() =>
    emptyWaitingFilter(resourceName),
  );

  const fetchReservations = useCallback(
    async (targetFilter) => {
      setIsLoading(true);
      try {
        const res = await PoPoAxios.get(`/${resource}`, {
          params: { ...buildQueryParams(targetFilter), status: WAITING_STATUS },
        });
        setReservations(res.data);
      } catch (err) {
        console.log(err);
        alert('예약 대기 목록을 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    },
    [resource],
  );

  useEffect(() => {
    fetchReservations(appliedFilter);
  }, [fetchReservations, appliedFilter]);

  return {
    reservations,
    isLoading,
    filter,
    setFilter,
    search: () => setAppliedFilter(filter),
    reset: () => {
      const empty = emptyWaitingFilter(resourceName);
      setFilter(empty);
      setAppliedFilter(empty);
    },
    appliedPeriod: appliedFilter.period,
  };
}

const WaitingReservationPane = ({ label, state, resource, children }) => {
  const { reservations, isLoading, filter, setFilter, search, reset } = state;

  return (
    <div style={{ marginTop: 12 }}>
      <ReservationFilter
        filter={filter}
        onChange={setFilter}
        onSubmit={search}
        onReset={reset}
        resource={resource}
        fields={WAITING_FILTER_FIELDS}
      />

      <p>
        {isLoading
          ? '로딩중...'
          : `${label} ${Number(reservations.length).toLocaleString()}건 대기중`}
      </p>

      {state.appliedPeriod === PERIOD.upcoming && (
        <p style={{ color: 'gray' }}>
          이미 종료된 예약은 기본적으로 숨겨져 있습니다. 확인이 필요하면 기간을
          &quot;지난 예약&quot;으로 바꿔주세요.
        </p>
      )}

      {isLoading ? <p>로딩 중...</p> : children}
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
  const [places, setPlaces] = useState([]);
  const placeState = useWaitingReservations('reservation-place', 'placeId');
  const equipState = useWaitingReservations('reservation-equip', 'owner');

  useEffect(() => {
    PoPoAxios.get('/place')
      .then((res) => setPlaces(res.data))
      .catch((err) => console.log(err));
  }, []);

  const placeResource = {
    name: 'placeId',
    label: '장소',
    options: places.map((place) => ({
      key: place.uuid,
      value: place.uuid,
      text: place.name,
    })),
  };

  const equipResource = {
    name: 'owner',
    label: '소유 기관',
    options: OwnerOptions,
  };

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
              <WaitingReservationPane
                label="장소 예약"
                state={placeState}
                resource={placeResource}
              >
                {placeState.reservations.length ? (
                  <PlaceReservationWaitTable
                    reservations={placeState.reservations}
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
              <WaitingReservationPane
                label="장비 예약"
                state={equipState}
                resource={equipResource}
              >
                {equipState.reservations.length ? (
                  <EquipmentReservationWaitTable
                    reservations={equipState.reservations}
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
