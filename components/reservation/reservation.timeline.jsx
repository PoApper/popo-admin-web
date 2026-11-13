import React, { useCallback, useMemo } from 'react';
import { Button, Checkbox, Label, Table } from 'semantic-ui-react';
import moment from 'moment';

import { useBulkAccept } from '@/utils/use-bulk-accept';
import {
  assignLanes,
  buildDensitySegments,
  getHourRange,
  predictBulkAccept,
  toInterval,
} from '@/utils/reservation-timeline';

const LABEL_COLUMN_WIDTH = 180;
const LANE_HEIGHT = 30;
const ROW_PADDING = 5;

const BLOCK_LABEL_PROPS = {
  accepted: {},
  waiting: { basic: true },
  conflict: { basic: true, color: 'red' },
  willAccept: { color: 'green' },
  willSkip: { color: 'red' },
};

const STATE_TEXT = {
  accepted: '승인됨',
  waiting: '심사중',
  conflict: '중복 (모두 승인하면 건너뜀)',
  willAccept: '선택 · 승인 예상',
  willSkip: '선택 · 건너뜀 예상',
};

function formatTime(time) {
  return moment(time, 'HHmm').format('HH:mm');
}

function densityColor(count, capacity) {
  if (count > capacity) return '#ffe8e6';
  return `rgba(0, 0, 0, ${0.025 + (0.05 * count) / Math.max(1, capacity)})`;
}

function blockTooltip(reservation, state) {
  return [
    reservation.title,
    `사용자: ${reservation.booker?.name ?? '-'}`,
    `예약 기간: ${formatTime(reservation.startTime)} ~ ${formatTime(reservation.endTime)}`,
    `예약 생성일: ${moment(reservation.createdAt).format('YYYY-MM-DD HH:mm')}`,
    `상태: ${STATE_TEXT[state]}`,
  ].join('\n');
}

// rowsOf: 예약 → 행 key 목록. 장비 예약은 여러 행에 나타날 수 있다.
const ReservationTimeline = ({
  resource,
  rowHeader,
  rows,
  reservations,
  rowsOf,
  ConfirmModal,
  onProcessed,
  isToday = false,
}) => {
  const waiting = useMemo(
    () => reservations.filter((reservation) => reservation.status === '심사중'),
    [reservations],
  );
  const accepted = useMemo(
    () => reservations.filter((reservation) => reservation.status === '통과'),
    [reservations],
  );

  const {
    selectedUuidList,
    isAllSelected,
    isSubmitting,
    submittingAction,
    toggle,
    toggleAllInPage,
    select,
    submit,
    reject,
  } = useBulkAccept(resource, waiting, onProcessed);

  const capacityByRow = useMemo(
    () => new Map(rows.map((row) => [row.key, row.capacity])),
    [rows],
  );
  const capacityOf = useCallback(
    (rowKey) => capacityByRow.get(rowKey) ?? 1,
    [capacityByRow],
  );

  // 선택하지 않은 예약은 '전부 승인했다면'을 기준으로 중복 여부를 표시한다.
  const predictionAll = useMemo(
    () =>
      predictBulkAccept({
        accepted,
        candidates: waiting,
        rowsOf,
        capacityOf,
      }),
    [accepted, waiting, rowsOf, capacityOf],
  );

  const selectedSet = useMemo(
    () => new Set(selectedUuidList),
    [selectedUuidList],
  );
  const predictionSelected = useMemo(
    () =>
      predictBulkAccept({
        accepted,
        candidates: waiting.filter((reservation) =>
          selectedSet.has(reservation.uuid),
        ),
        rowsOf,
        capacityOf,
      }),
    [accepted, waiting, selectedSet, rowsOf, capacityOf],
  );

  function stateOf(reservation) {
    if (reservation.status === '통과') return 'accepted';
    if (selectedSet.has(reservation.uuid)) {
      return predictionSelected.acceptUuidSet.has(reservation.uuid)
        ? 'willAccept'
        : 'willSkip';
    }
    return predictionAll.skipUuidSet.has(reservation.uuid)
      ? 'conflict'
      : 'waiting';
  }

  const { startHour, endHour } = useMemo(
    () => getHourRange(reservations),
    [reservations],
  );
  const rangeStart = startHour * 60;
  const rangeMinutes = (endHour - startHour) * 60;
  const toPercent = (minutes) =>
    `${((minutes - rangeStart) / rangeMinutes) * 100}%`;
  const toWidthPercent = (minutes) => `${(minutes / rangeMinutes) * 100}%`;
  const hours = Array.from(
    { length: endHour - startHour + 1 },
    (_, i) => startHour + i,
  );

  // 허용치를 넘는 행 → 심사중이 있는 행 → 나머지 순으로 올린다.
  const rowViews = useMemo(() => {
    const reservationsByRow = new Map(rows.map((row) => [row.key, []]));
    reservations.forEach((reservation) => {
      rowsOf(reservation).forEach((rowKey) => {
        if (reservationsByRow.has(rowKey)) {
          reservationsByRow.get(rowKey).push(reservation);
        }
      });
    });

    const views = rows.map((row, order) => {
      const rowReservations = reservationsByRow.get(row.key);
      const segments = buildDensitySegments(rowReservations);
      return {
        ...row,
        order,
        reservations: rowReservations,
        segments,
        isOverCapacity: segments.some(
          (segment) => segment.count > row.capacity,
        ),
        waitingCount: rowReservations.filter(
          (reservation) => reservation.status === '심사중',
        ).length,
        ...assignLanes(rowReservations),
      };
    });

    const rank = (view) =>
      view.isOverCapacity ? 0 : view.waitingCount > 0 ? 1 : 2;
    return views.sort((a, b) => rank(a) - rank(b) || a.order - b.order);
  }, [rows, reservations, rowsOf]);

  const acceptableUuidList = waiting
    .filter((reservation) => predictionAll.acceptUuidSet.has(reservation.uuid))
    .map((reservation) => reservation.uuid);
  const selectedSkipCount = predictionSelected.skipUuidSet.size;
  const nowMinutes = moment().hours() * 60 + moment().minutes();

  const hourLines = hours.map((hour) => (
    <div
      key={hour}
      style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: toPercent(hour * 60),
        borderLeft: '1px solid rgba(34, 36, 38, 0.1)',
      }}
    />
  ));

  const bulkActionPanel = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'left',
      }}
    >
      <p style={{ fontWeight: 400 }}>
        일괄 승인/거절은 <b>체크한 예약</b>만 예약 생성 순으로 처리하며, 안내
        메일은 보내지 않습니다.
        <br />
        먼저 승인된 예약과 겹치는 예약은 <b>건너뜁니다</b>.
        {predictionAll.skipUuidSet.size > 0 && (
          <>
            <br />
            <span style={{ color: 'red' }}>
              모두 승인하면 {predictionAll.skipUuidSet.size}건이 건너뛰어집니다.
            </span>
          </>
        )}
      </p>
      <div>
        <Button
          size="small"
          floated="right"
          disabled={acceptableUuidList.length === 0}
          onClick={() => select(acceptableUuidList)}
        >
          승인 가능한 예약만 선택 ({acceptableUuidList.length}건)
        </Button>
        <Button
          positive
          size="small"
          floated="right"
          loading={submittingAction === 'accept'}
          disabled={isSubmitting}
          onClick={submit}
        >
          예약 일괄 승인 ({selectedUuidList.length}건
          {selectedSkipCount ? `, 건너뜀 예상 ${selectedSkipCount}건` : ''})
        </Button>
        <Button
          negative
          size="small"
          floated="right"
          loading={submittingAction === 'reject'}
          disabled={isSubmitting}
          onClick={reject}
        >
          예약 일괄 거절 ({selectedUuidList.length}건)
        </Button>
      </div>
    </div>
  );

  const legend = (
    <div style={{ textAlign: 'left', fontWeight: 400 }}>
      {['accepted', 'waiting', 'conflict', 'willAccept', 'willSkip'].map(
        (state) => (
          <Label key={state} size="mini" {...BLOCK_LABEL_PROPS[state]}>
            {STATE_TEXT[state]}
          </Label>
        ),
      )}
      <Label size="mini" style={{ background: '#ffe8e6' }}>
        허용 개수 초과
      </Label>
    </div>
  );

  return (
    <Table celled unstackable style={{ tableLayout: 'fixed' }}>
      {/* 첫 행이 colSpan 이라 고정 레이아웃의 열 너비를 여기서 정한다. */}
      <colgroup>
        <col style={{ width: LABEL_COLUMN_WIDTH }} />
        <col />
      </colgroup>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>{legend}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell>
            <Checkbox
              label={rowHeader}
              checked={isAllSelected}
              indeterminate={
                selectedUuidList.length > 0 &&
                selectedUuidList.length < waiting.length
              }
              onChange={toggleAllInPage}
              title="심사중 예약 전체 선택"
            />
          </Table.HeaderCell>
          <Table.HeaderCell style={{ padding: 0 }}>
            <div style={{ position: 'relative', height: '2.8em' }}>
              {hours.slice(0, -1).map((hour) => (
                <span
                  key={hour}
                  style={{
                    position: 'absolute',
                    left: toPercent(hour * 60),
                    paddingLeft: 4,
                    lineHeight: '2.8em',
                  }}
                >
                  {String(hour).padStart(2, '0')}
                </span>
              ))}
            </div>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rowViews.map((row) => (
          <Table.Row key={row.key}>
            <Table.Cell verticalAlign="top">
              <b>{row.label}</b>
              <br />
              <span style={{ color: 'gray' }}>동시 {row.capacity}건</span>
              {row.isOverCapacity && (
                <Label color="red" size="mini" style={{ marginLeft: '0.5rem' }}>
                  중복
                </Label>
              )}
            </Table.Cell>
            <Table.Cell style={{ padding: 0 }}>
              <div
                style={{
                  position: 'relative',
                  height: row.laneCount * LANE_HEIGHT + ROW_PADDING * 2,
                }}
              >
                {row.segments.map((segment) => (
                  <div
                    key={`${segment.start}-${segment.end}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: toPercent(segment.start),
                      width: toWidthPercent(segment.end - segment.start),
                      background: densityColor(segment.count, row.capacity),
                    }}
                  />
                ))}
                {hourLines}
                {isToday && nowMinutes >= rangeStart && (
                  <div
                    title="현재 시각"
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: toPercent(nowMinutes),
                      borderLeft: '2px solid #db2828',
                      zIndex: 2,
                    }}
                  />
                )}

                {row.reservations.map((reservation) => {
                  const { start, end } = toInterval(reservation);
                  const state = stateOf(reservation);
                  const isWaiting = reservation.status === '심사중';
                  const block = (
                    <Label
                      {...BLOCK_LABEL_PROPS[state]}
                      title={blockTooltip(reservation, state)}
                      style={{
                        position: 'absolute',
                        top:
                          ROW_PADDING +
                          row.laneByUuid.get(reservation.uuid) * LANE_HEIGHT,
                        height: LANE_HEIGHT - 4,
                        left: toPercent(start),
                        width: toWidthPercent(end - start),
                        margin: 0,
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4em',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        cursor: isWaiting ? 'pointer' : 'default',
                        zIndex: 1,
                      }}
                    >
                      {isWaiting && (
                        <span
                          onClick={(event) => event.stopPropagation()}
                          style={{ display: 'flex', flexShrink: 0 }}
                        >
                          <Checkbox
                            checked={selectedSet.has(reservation.uuid)}
                            onChange={() => toggle(reservation.uuid)}
                          />
                        </span>
                      )}
                      <span
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {reservation.title}
                        <span style={{ marginLeft: '0.4em', opacity: 0.7 }}>
                          {reservation.booker?.name}
                        </span>
                      </span>
                    </Label>
                  );

                  return isWaiting ? (
                    <ConfirmModal
                      key={reservation.uuid}
                      reservation={reservation}
                      trigger={block}
                      onProcessed={onProcessed}
                    />
                  ) : (
                    <React.Fragment key={reservation.uuid}>
                      {block}
                    </React.Fragment>
                  );
                })}
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>

      <Table.Footer fullWidth>
        <Table.Row>
          <Table.HeaderCell colSpan={2}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default ReservationTimeline;
