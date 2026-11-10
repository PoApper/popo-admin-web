import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Checkbox, Form, Label, Segment, Tab } from 'semantic-ui-react';
import moment from 'moment';

import { PoPoAxios } from '@/utils/axios.instance';
import ReservationLayout from '@/components/reservation/reservation.layout';
import ReservationTimeline from '@/components/reservation/reservation.timeline';
import PlaceReservationConfirmModal from '@/components/place/place.reservation.confirm.modal';
import EquipmentReservationConfirmModal from '@/components/equipment/equipment.reservation.confirm.modal';
import { OwnerOptions } from '@/assets/owner.options';

const DATE_INPUT_FORMAT = 'YYYY-MM-DD';
const API_DATE_FORMAT = 'YYYYMMDD';
const MAX_DATE_CHIPS = 30;
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// moment 한국어 locale 을 불러오지 않으므로 요일은 직접 붙인다.
function formatWithWeekday(value, inputFormat, outputFormat) {
  const m = moment(value, inputFormat);
  return `${m.format(outputFormat)} (${WEEKDAYS[m.day()]})`;
}

const RESOURCES = {
  place: {
    label: '장소',
    rowHeader: '장소명',
    endpoint: 'reservation-place',
    ConfirmModal: PlaceReservationConfirmModal,
    rowsOf: (reservation) => [reservation.placeId],
  },
  equip: {
    label: '장비',
    rowHeader: '장비명',
    endpoint: 'reservation-equip',
    ConfirmModal: EquipmentReservationConfirmModal,
    rowsOf: (reservation) =>
      (reservation.equipments ?? []).map((equipment) => equipment.uuid),
  },
};

const OWNER_FILTER_OPTIONS = [
  { key: 'all', value: '', text: '전체 소유 기관' },
  ...OwnerOptions,
];

function useWaitingDates(resourceKey, owner, refreshKey) {
  const [dateCounts, setDateCounts] = useState([]);

  useEffect(() => {
    const params = {
      status: '심사중',
      startDate: moment().format(API_DATE_FORMAT),
      orderBy: 'date',
      orderDirection: 'ASC',
    };
    if (resourceKey === 'equip' && owner) params.owner = owner;

    let isStale = false;
    PoPoAxios.get(`/${RESOURCES[resourceKey].endpoint}`, { params })
      .then((res) => {
        if (isStale) return;
        const counts = new Map();
        res.data.forEach((reservation) => {
          counts.set(reservation.date, (counts.get(reservation.date) ?? 0) + 1);
        });
        setDateCounts(
          Array.from(counts, ([date, count]) => ({ date, count })).sort(
            (a, b) => a.date.localeCompare(b.date),
          ),
        );
      })
      .catch((err) => console.log(err));
    return () => {
      isStale = true;
    };
  }, [resourceKey, owner, refreshKey]);

  return dateCounts;
}

const ReservationTimelinePage = () => {
  const [resourceKey, setResourceKey] = useState('place');
  const [date, setDate] = useState(() => moment().format(DATE_INPUT_FORMAT));
  const [owner, setOwner] = useState('');
  const [showEmptyRows, setShowEmptyRows] = useState(false);
  const [places, setPlaces] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const latestRequestId = useRef(0);

  const resource = RESOURCES[resourceKey];
  const apiDate = moment(date, DATE_INPUT_FORMAT).format(API_DATE_FORMAT);
  const waitingDates = useWaitingDates(resourceKey, owner, refreshKey);

  useEffect(() => {
    PoPoAxios.get('/place')
      .then((res) => setPlaces(res.data))
      .catch((err) => console.log(err));
  }, []);

  // 조건을 빠르게 바꾸면 이전 요청이 늦게 끝날 수 있어, 마지막 요청의 결과만 반영한다.
  const fetchReservations = useCallback(async () => {
    const requestId = ++latestRequestId.current;
    const isStale = () => requestId !== latestRequestId.current;
    setIsLoading(true);
    try {
      const params = {
        startDate: apiDate,
        endDate: apiDate,
        orderBy: 'createdAt',
        orderDirection: 'ASC',
      };
      if (resourceKey === 'equip' && owner) params.owner = owner;

      const res = await PoPoAxios.get(`/${RESOURCES[resourceKey].endpoint}`, {
        params,
      });
      if (isStale()) return;
      // 거절된 예약은 자리를 차지하지 않으므로 그리지 않는다.
      setReservations(
        res.data.filter((reservation) =>
          ['심사중', '통과'].includes(reservation.status),
        ),
      );
    } catch (err) {
      if (isStale()) return;
      console.log(err);
      // 이전 조건의 예약을 이 날짜의 것으로 오인해 승인하지 않도록 비운다.
      setReservations([]);
      alert('예약 목록을 불러오는데 실패했습니다.');
    } finally {
      if (!isStale()) setIsLoading(false);
    }
  }, [apiDate, resourceKey, owner]);

  // 승인/거절이 끝나기 전에 조건이 바뀔 수 있어, 처리 후에는 그 시점의 조건으로 다시 조회한다.
  const fetchLatestReservations = useRef(fetchReservations);
  useEffect(() => {
    fetchLatestReservations.current = fetchReservations;
    fetchReservations();
  }, [fetchReservations]);

  const handleProcessed = useCallback(async () => {
    setRefreshKey((key) => key + 1);
    await fetchLatestReservations.current();
  }, []);

  const rows = useMemo(() => {
    if (resourceKey === 'place') {
      const usedPlaceIds = new Set(
        reservations.map((reservation) => reservation.placeId),
      );
      return places
        .filter((place) => showEmptyRows || usedPlaceIds.has(place.uuid))
        .map((place) => ({
          key: place.uuid,
          label: place.name,
          capacity: place.maxConcurrentReservation ?? 1,
        }));
    }

    // 장비는 그날 예약에 등장한 장비만 행으로 만든다. 장비 하나는 동시에 한 건만 가능하다.
    const equipmentByUuid = new Map();
    reservations.forEach((reservation) => {
      (reservation.equipments ?? []).forEach((equipment) => {
        equipmentByUuid.set(equipment.uuid, equipment);
      });
    });
    return Array.from(equipmentByUuid.values())
      .sort((a, b) => String(a.name).localeCompare(String(b.name)))
      .map((equipment) => ({
        key: equipment.uuid,
        label: equipment.name,
        capacity: 1,
      }));
  }, [resourceKey, reservations, places, showEmptyRows]);

  const moveDate = (days) =>
    setDate(
      moment(date, DATE_INPUT_FORMAT)
        .add(days, 'day')
        .format(DATE_INPUT_FORMAT),
    );
  const isToday = date === moment().format(DATE_INPUT_FORMAT);

  const content = (
    <div style={{ marginTop: 12 }}>
      <Segment>
        <Form>
          <Form.Group widths="equal">
            <Form.Input
              type="date"
              label="예약일"
              value={date}
              onChange={(event, { value }) => value && setDate(value)}
            />
            {resourceKey === 'equip' && (
              <Form.Select
                label="소유 기관"
                options={OWNER_FILTER_OPTIONS}
                value={owner}
                onChange={(event, { value }) => setOwner(value)}
              />
            )}
          </Form.Group>
          <Button type="button" onClick={() => moveDate(-1)}>
            이전 날
          </Button>
          <Button
            type="button"
            onClick={() => setDate(moment().format(DATE_INPUT_FORMAT))}
          >
            오늘
          </Button>
          <Button type="button" onClick={() => moveDate(1)}>
            다음 날
          </Button>
          {resourceKey === 'place' && (
            <Checkbox
              label="예약 없는 장소도 보기"
              checked={showEmptyRows}
              onChange={() => setShowEmptyRows(!showEmptyRows)}
              style={{ marginLeft: '1rem' }}
            />
          )}
        </Form>
      </Segment>

      {waitingDates.length > 0 && (
        <p>
          심사중 예약이 있는 날짜:{' '}
          {waitingDates.slice(0, MAX_DATE_CHIPS).map(({ date: d, count }) => (
            <Label
              key={d}
              as="a"
              size="small"
              color={d === apiDate ? 'blue' : undefined}
              onClick={() =>
                setDate(moment(d, API_DATE_FORMAT).format(DATE_INPUT_FORMAT))
              }
              style={{ marginBottom: 4 }}
            >
              {formatWithWeekday(d, API_DATE_FORMAT, 'M/D')}
              <Label.Detail>{count}건</Label.Detail>
            </Label>
          ))}
          {waitingDates.length > MAX_DATE_CHIPS &&
            ` 외 ${waitingDates.length - MAX_DATE_CHIPS}일`}
        </p>
      )}

      <p>
        {formatWithWeekday(date, DATE_INPUT_FORMAT, 'YYYY년 MM월 DD일')}{' '}
        {resource.label} 예약
      </p>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : rows.length === 0 ? (
        <p>
          이 날짜에는 승인되었거나 심사중인 {resource.label} 예약이 없습니다 🎈
        </p>
      ) : (
        <ReservationTimeline
          key={`${resourceKey}-${apiDate}`}
          resource={resource.endpoint}
          rowHeader={resource.rowHeader}
          rows={rows}
          reservations={reservations}
          rowsOf={resource.rowsOf}
          ConfirmModal={resource.ConfirmModal}
          onProcessed={handleProcessed}
          isToday={isToday}
        />
      )}
    </div>
  );

  const resourceKeys = Object.keys(RESOURCES);

  return (
    <ReservationLayout>
      <h3>예약 타임라인</h3>
      <p>
        승인된 예약과 <b>심사중</b> 예약을 시간표로 함께 보여줍니다. 심사중
        예약을 누르면 승인/거절할 수 있습니다.
      </p>

      <Tab
        activeIndex={resourceKeys.indexOf(resourceKey)}
        onTabChange={(event, { activeIndex }) =>
          setResourceKey(resourceKeys[activeIndex])
        }
        panes={resourceKeys.map((key) => ({
          menuItem: `${RESOURCES[key].label} 예약`,
          render: () => content,
        }))}
      />
    </ReservationLayout>
  );
};

export default ReservationTimelinePage;
