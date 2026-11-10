import moment from 'moment';

import { timeStringToMinutes } from '@/utils/reservation-overlap';

// 행(row)은 장소 하나 또는 장비 하나다. 행마다 동시 허용 수(capacity)가 있으며
// 장소는 maxConcurrentReservation, 장비는 1이다.

export function toInterval(reservation) {
  return {
    start: timeStringToMinutes(reservation.startTime, false),
    end: timeStringToMinutes(reservation.endTime, true),
  };
}

// [start, end) 안의 최대 동시 겹침 수. 경계가 맞닿으면 겹치지 않는다.
export function maxConcurrency(intervals, start, end) {
  const events = [];
  intervals.forEach((interval) => {
    const s = Math.max(interval.start, start);
    const e = Math.min(interval.end, end);
    if (s < e) {
      events.push({ time: s, delta: 1 });
      events.push({ time: e, delta: -1 });
    }
  });
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  let current = 0;
  let max = 0;
  events.forEach((event) => {
    current += event.delta;
    max = Math.max(max, current);
  });
  return max;
}

function byCreatedAt(a, b) {
  return moment(a.createdAt).diff(moment(b.createdAt));
}

// 서버 일괄 승인과 같은 순서(신청 빠른 순)로 승인/건너뜀을 예측한다.
// 시간 겹침만 보며, 사용 가능 시간·최소 예약 일수는 서버에서만 검사한다.
export function predictBulkAccept({
  accepted,
  candidates,
  rowsOf,
  capacityOf,
}) {
  const intervalsByRow = new Map();
  const pushInterval = (rowKey, interval) => {
    if (!intervalsByRow.has(rowKey)) intervalsByRow.set(rowKey, []);
    intervalsByRow.get(rowKey).push(interval);
  };

  accepted.forEach((reservation) => {
    rowsOf(reservation).forEach((rowKey) =>
      pushInterval(rowKey, toInterval(reservation)),
    );
  });

  const acceptUuidSet = new Set();
  const skipUuidSet = new Set();

  candidates
    .slice()
    .sort(byCreatedAt)
    .forEach((candidate) => {
      const interval = toInterval(candidate);
      const rowKeys = rowsOf(candidate);
      const isPossible = rowKeys.every(
        (rowKey) =>
          maxConcurrency(
            intervalsByRow.get(rowKey) ?? [],
            interval.start,
            interval.end,
          ) +
            1 <=
          capacityOf(rowKey),
      );

      if (isPossible) {
        acceptUuidSet.add(candidate.uuid);
        rowKeys.forEach((rowKey) => pushInterval(rowKey, interval));
      } else {
        skipUuidSet.add(candidate.uuid);
      }
    });

  return { acceptUuidSet, skipUuidSet };
}

// 승인된 예약을 위 줄에, 심사중 예약은 신청 순으로 그 아래 줄에 쌓는다.
export function assignLanes(reservations) {
  const sorted = reservations.slice().sort((a, b) => {
    const aAccepted = a.status === '통과' ? 0 : 1;
    const bAccepted = b.status === '통과' ? 0 : 1;
    return aAccepted - bAccepted || byCreatedAt(a, b);
  });

  const laneEnds = [];
  const laneByUuid = new Map();

  sorted.forEach((reservation) => {
    const { start, end } = toInterval(reservation);
    let lane = laneEnds.findIndex((laneEnd) =>
      laneEnd.every(
        (occupied) => occupied.end <= start || end <= occupied.start,
      ),
    );
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push([]);
    }
    laneEnds[lane].push({ start, end });
    laneByUuid.set(reservation.uuid, lane);
  });

  return { laneByUuid, laneCount: Math.max(1, laneEnds.length) };
}

export function buildDensitySegments(reservations) {
  const intervals = reservations.map(toInterval);
  const points = Array.from(
    new Set(intervals.flatMap((interval) => [interval.start, interval.end])),
  ).sort((a, b) => a - b);

  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i];
    const end = points[i + 1];
    const count = intervals.filter(
      (interval) => interval.start <= start && end <= interval.end,
    ).length;
    if (count > 0) segments.push({ start, end, count });
  }
  return segments;
}

export function getHourRange(reservations, defaultStart = 8, defaultEnd = 24) {
  let startHour = defaultStart;
  let endHour = defaultEnd;
  reservations.forEach((reservation) => {
    const { start, end } = toInterval(reservation);
    startHour = Math.min(startHour, Math.floor(start / 60));
    endHour = Math.max(endHour, Math.ceil(end / 60));
  });
  return { startHour, endHour };
}
