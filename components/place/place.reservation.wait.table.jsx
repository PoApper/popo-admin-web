import React, { useMemo } from 'react';
import { Checkbox, Table, Button, Label, Popup } from 'semantic-ui-react';
import moment from 'moment';
import PlaceReservationConfirmModal from './place.reservation.confirm.modal';
import { getReservationConflicts } from '@/utils/reservation-overlap';
import { isReservationOutdated } from '@/utils/reservation-period';
import { useBulkAccept } from '@/utils/use-bulk-accept';

const PlaceReservationWaitTable = ({ reservations, startIdx = 0 }) => {
  const {
    selectedUuidList,
    isAllSelected,
    isSubmitting,
    toggle,
    toggleAllInPage,
    select,
    submit,
  } = useBulkAccept('reservation-place', reservations);

  const { conflictUuidSet, conflictPartnersByUuid } = useMemo(
    () => getReservationConflicts(reservations),
    [reservations],
  );

  const nonConflictUuidList = useMemo(
    () =>
      reservations
        .filter((reservation) => !conflictUuidSet.has(reservation.uuid))
        .map((reservation) => reservation.uuid),
    [reservations, conflictUuidSet],
  );

  const selectedConflictCount = selectedUuidList.filter((uuid) =>
    conflictUuidSet.has(uuid),
  ).length;

  function selectNonConflictReservations() {
    if (nonConflictUuidList.length === 0) {
      alert('이 페이지에는 중복되지 않은 대기 예약이 없습니다.');
      return;
    }
    select(nonConflictUuidList);
  }

  const bulkActionPanel = (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        textAlign: 'left',
      }}
    >
      <p style={{ fontWeight: 400 }}>
        일괄 승인은 <b>현재 페이지에서 체크한 예약</b>만 대상으로, 예약 생성
        순으로 처리됩니다.
        <br />
        승인할 수 없는 예약(중복 등)은 <b>건너뛰고</b> 나머지를 계속 처리한 뒤,
        건너뛴 목록을 알려줍니다.
        <br />
        일괄 예약 승인 때는 승인 메일을 보내지 않습니다.
        {conflictUuidSet.size > 0 && (
          <>
            <br />
            <span style={{ color: 'red' }}>
              이 페이지에 시간이 겹치는 예약 {conflictUuidSet.size}건이
              있습니다. &quot;중복&quot; 표시를 확인해주세요.
            </span>
          </>
        )}
      </p>
      <div>
        <Button
          size="small"
          floated="right"
          onClick={selectNonConflictReservations}
        >
          중복 없는 예약만 선택 ({nonConflictUuidList.length}건)
        </Button>
        <Button
          positive
          size="small"
          floated="right"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={submit}
        >
          예약 일괄 승인 ({selectedUuidList.length}건
          {selectedConflictCount
            ? `, 중복 ${selectedConflictCount}건 포함`
            : ''}
          )
        </Button>
      </div>
    </div>
  );

  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={6}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell width={1}>idx.</Table.HeaderCell>
          <Table.HeaderCell width={3}>장소명</Table.HeaderCell>
          <Table.HeaderCell width={2}>사용자</Table.HeaderCell>
          <Table.HeaderCell>예약 제목</Table.HeaderCell>
          <Table.HeaderCell width={4}>예약 기간</Table.HeaderCell>
          <Table.HeaderCell width={1}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={
                selectedUuidList.length > 0 &&
                selectedUuidList.length < reservations.length
              }
              onChange={toggleAllInPage}
              title="이 페이지 전체 선택"
            />
          </Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {reservations.map((reservation, idx) => {
          const startDatetime = moment(
            `${reservation.date} ${reservation.startTime}`,
            'YYYYMMDD HHmm',
          );
          const endDatetime = moment(
            `${reservation.date} ${reservation.endTime}`,
            'YYYYMMDD HHmm',
          );

          const isOutdated = isReservationOutdated(reservation);
          const isNow =
            !isOutdated && startDatetime <= moment() && moment() <= endDatetime;
          const isConflict = conflictUuidSet.has(reservation.uuid);
          const conflictPartners =
            conflictPartnersByUuid.get(reservation.uuid) ?? [];

          return (
            <Table.Row
              key={reservation.uuid}
              negative={isOutdated}
              positive={isNow}
              warning={!isOutdated && !isNow && isConflict}
            >
              <Table.Cell>{startIdx + idx + 1}</Table.Cell>
              <Table.Cell>{reservation.place.name}</Table.Cell>
              <Table.Cell>{reservation.booker.name}</Table.Cell>
              <PlaceReservationConfirmModal
                key={reservation.uuid}
                reservation={reservation}
                trigger={<Table.Cell>{reservation.title}</Table.Cell>}
              />
              <Table.Cell>
                <b>
                  {moment(reservation.date, 'YYYYMMDD').format(
                    'YYYY년 MM월 DD일',
                  )}
                  <br />
                  {moment(reservation.startTime, 'HHmm').format('HH:mm')}
                  &nbsp;~&nbsp;
                  {moment(reservation.endTime, 'HHmm').format('HH:mm')}
                </b>
                {isConflict && (
                  <Popup
                    trigger={
                      <Label
                        color="red"
                        size="mini"
                        style={{ marginLeft: '0.5rem' }}
                      >
                        중복
                      </Label>
                    }
                    content={
                      conflictPartners.length
                        ? `겹치는 예약: ${conflictPartners
                            .map(
                              (partner) =>
                                `${partner.title} (${moment(
                                  partner.startTime,
                                  'HHmm',
                                ).format('HH:mm')}~${moment(
                                  partner.endTime,
                                  'HHmm',
                                ).format('HH:mm')})`,
                            )
                            .join(', ')}`
                        : '같은 장소·시간대에 동시 예약 허용 개수를 초과하는 예약이 있습니다.'
                    }
                  />
                )}
              </Table.Cell>
              <Table.Cell>
                <Checkbox
                  checked={selectedUuidList.includes(reservation.uuid)}
                  onChange={() => toggle(reservation.uuid)}
                />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>

      <Table.Footer fullWidth>
        <Table.Row>
          <Table.HeaderCell colSpan={6}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default PlaceReservationWaitTable;
