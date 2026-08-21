/**
 * 대기 중인 장소 예약들 사이의 중복(동시 예약 초과) 여부를 계산한다.
 *
 * 관리자가 일괄 승인을 누르기 전에 "어떤 예약이 서로 겹치는지"를 눈으로 확인할 수 있게 하려고 만들었다.
 * 최종 판정은 서버(checkReservationPossible)가 하며, 이 함수는 화면 표시용이다.
 */

const MINUTES_PER_DAY = 24 * 60;

/**
 * 'HHmm' 문자열을 분 단위로 변환한다.
 * 백엔드와 마찬가지로 종료 시각의 '0000'은 자정(1440분)으로 취급한다.
 */
export function timeStringToMinutes(time, isEnd = false) {
  if (isEnd && time === '0000') {
    return MINUTES_PER_DAY;
  }
  const hours = Number(String(time).slice(0, 2));
  const minutes = Number(String(time).slice(2, 4));
  return hours * 60 + minutes;
}

function isTimeRangeOverlapped(a, b) {
  const aStart = timeStringToMinutes(a.startTime, false);
  const aEnd = timeStringToMinutes(a.endTime, true);
  const bStart = timeStringToMinutes(b.startTime, false);
  const bEnd = timeStringToMinutes(b.endTime, true);

  // 경계가 맞닿는 경우(예: 14:00~15:00 과 15:00~16:00)는 겹치지 않는다.
  return aStart < bEnd && bStart < aEnd;
}

/**
 * 같은 장소·같은 날짜의 예약들끼리만 겹칠 수 있으므로 그룹으로 나눈다.
 */
function groupByPlaceAndDate(reservations) {
  const groups = new Map();

  reservations.forEach((reservation) => {
    const key = `${reservation.placeId}_${reservation.date}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(reservation);
  });

  return Array.from(groups.values());
}

/**
 * 한 그룹(같은 장소·같은 날짜) 안에서, 동시 예약 허용 개수를 넘기게 만드는 예약들을 찾는다.
 *
 * 라인스위핑으로 어느 시점에 동시 예약이 허용치를 넘는지 찾고,
 * 그 시점에 걸쳐 있는 예약들을 모두 중복으로 표시한다.
 */
function findConflictUuidsInGroup(group, maxConcurrentReservation) {
  if (group.length <= maxConcurrentReservation) {
    return [];
  }

  const events = [];
  group.forEach((reservation) => {
    events.push({
      time: timeStringToMinutes(reservation.startTime, false),
      delta: 1,
    });
    events.push({
      time: timeStringToMinutes(reservation.endTime, true),
      delta: -1,
    });
  });

  // 같은 시각이면 종료(-1)를 먼저 처리해, 경계가 맞닿는 예약을 겹침으로 세지 않는다.
  events.sort((a, b) => a.time - b.time || a.delta - b.delta);

  const overCapacityTimes = [];
  let concurrentCount = 0;
  events.forEach((event) => {
    concurrentCount += event.delta;
    if (concurrentCount > maxConcurrentReservation) {
      overCapacityTimes.push(event.time);
    }
  });

  if (overCapacityTimes.length === 0) {
    return [];
  }

  const conflictUuids = new Set();
  group.forEach((reservation) => {
    const start = timeStringToMinutes(reservation.startTime, false);
    const end = timeStringToMinutes(reservation.endTime, true);
    const isOverlappingOverCapacity = overCapacityTimes.some(
      (time) => start <= time && time < end,
    );
    if (isOverlappingOverCapacity) {
      conflictUuids.add(reservation.uuid);
    }
  });

  return Array.from(conflictUuids);
}

/**
 * 중복 예약 정보를 계산한다.
 *
 * @param reservations 대기 중인 예약 목록 (place 가 join 된 상태)
 * @returns {{
 *   conflictUuidSet: Set<string>,
 *   conflictPartnersByUuid: Map<string, object[]>,
 * }}
 */
export function getReservationConflicts(reservations = []) {
  const conflictUuidSet = new Set();
  const conflictPartnersByUuid = new Map();

  groupByPlaceAndDate(reservations).forEach((group) => {
    // 장소 정보가 없으면 기본값 1로 간주한다.
    const maxConcurrentReservation =
      group[0]?.place?.maxConcurrentReservation ?? 1;

    const conflictUuids = findConflictUuidsInGroup(
      group,
      maxConcurrentReservation,
    );

    conflictUuids.forEach((uuid) => conflictUuidSet.add(uuid));

    // 각 예약이 구체적으로 어떤 예약과 겹치는지 알려주기 위해 상대를 찾아둔다.
    group.forEach((reservation) => {
      if (!conflictUuids.includes(reservation.uuid)) {
        return;
      }
      const partners = group.filter(
        (other) =>
          other.uuid !== reservation.uuid &&
          isTimeRangeOverlapped(reservation, other),
      );
      if (partners.length) {
        conflictPartnersByUuid.set(reservation.uuid, partners);
      }
    });
  });

  return { conflictUuidSet, conflictPartnersByUuid };
}
