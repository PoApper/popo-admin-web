import React, { useMemo, useState } from 'react';
import { Checkbox, Table, Button, Label, Popup } from 'semantic-ui-react';
import moment from 'moment';
import PlaceReservationConfirmModal from './place.reservation.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';
import { getReservationConflicts } from '@/utils/reservation-overlap';

const PlaceReservationWaitTable = ({ reservations }) => {
  const [selectedUuidList, setSelectedUuidList] = useState([]);

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

  function buildBulkAcceptResultMessage(result) {
    const { acceptedCount, skippedCount, skippedList } = result;

    const lines = [
      `승인 ${acceptedCount}건, 건너뜀 ${skippedCount}건 처리했습니다.`,
    ];

    if (skippedCount) {
      lines.push('');
      lines.push('[건너뛴 예약]');
      skippedList.forEach((skipped) => {
        const date = moment(skipped.date, 'YYYYMMDD').format('YYYY-MM-DD');
        const startTime = moment(skipped.startTime, 'HHmm').format('HH:mm');
        const endTime = moment(skipped.endTime, 'HHmm').format('HH:mm');
        lines.push(
          `- ${skipped.title} (${date} ${startTime}~${endTime}): ${skipped.reason}`,
        );
      });
    }

    return lines.join('\n');
  }

  function acceptAllInProgressPlaceReservations() {
    if (selectedUuidList.length === 0) {
      alert('일괄 승인할 예약을 먼저 선택해주세요.');
      return;
    }

    PoPoAxios.patch('/reservation-place/all/status/accept', {
      uuidList: selectedUuidList,
    })
      .then((res) => {
        alert(buildBulkAcceptResultMessage(res.data));
        window.location.reload();
      })
      .catch((err) => {
        const errMsg = err.response?.data?.message ?? err.message;
        alert(`전체 예약 승인에 실패했습니다.\n${errMsg}`);
      });
  }

  function selectNonConflictReservations() {
    if (nonConflictUuidList.length === 0) {
      alert('중복되지 않은 대기 예약이 없습니다.');
      return;
    }
    setSelectedUuidList(nonConflictUuidList);
  }

  function handleCheck(newUuid) {
    const currentList = selectedUuidList;
    const isTargetSelected = currentList.includes(newUuid);

    const newList = isTargetSelected
      ? currentList.filter((uuid) => uuid !== newUuid)
      : currentList.concat(newUuid);

    setSelectedUuidList(newList);
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
        일괄 예약 승인은 예약 생성 순으로 처리 됩니다.
        <br />
        승인할 수 없는 예약(중복 등)은 <b>건너뛰고</b> 나머지 예약을 계속 처리한
        뒤, 건너뛴 목록을 알려줍니다.
        <br />
        일괄 예약 승인 때는 승인 메일을 보내지 않습니다.
        <br />
        {conflictUuidSet.size > 0 && (
          <span style={{ color: 'red' }}>
            시간이 겹치는 대기 예약 {conflictUuidSet.size}건이 있습니다.
            &quot;중복&quot; 표시를 확인해주세요.
          </span>
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
          onClick={acceptAllInProgressPlaceReservations}
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
          <Table.HeaderCell width={1} />
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

          const isOutdated = moment() > endDatetime;
          const isNow = startDatetime <= moment() && moment() <= endDatetime;
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
              <Table.Cell>{idx + 1}</Table.Cell>
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
                  onChange={() => handleCheck(reservation.uuid)}
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
