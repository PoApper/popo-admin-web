import React from 'react';
import { Button, Checkbox, Label, Table } from 'semantic-ui-react';
import moment from 'moment';
import EquipmentReservationConfirmModal from './equipment.reservation.confirm.modal';
import { isReservationOutdated } from '@/utils/reservation-period';
import { useBulkAccept } from '@/utils/use-bulk-accept';

const EquipmentReservationWaitTable = ({ reservations, startIdx = 0 }) => {
  const {
    selectedUuidList,
    isAllSelected,
    isSubmitting,
    toggle,
    toggleAllInPage,
    submit,
  } = useBulkAccept('reservation-equip', reservations);

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
        같은 장비의 시간이 겹치는 예약은 <b>건너뛰고</b> 나머지를 계속 처리한
        뒤, 건너뛴 목록을 알려줍니다.
        <br />
        일괄 예약 승인 때는 승인 메일을 보내지 않습니다.
      </p>
      <div>
        <Button
          positive
          size="small"
          floated="right"
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={submit}
        >
          예약 일괄 승인 ({selectedUuidList.length}건)
        </Button>
      </div>
    </div>
  );

  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={7}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell width={1}>idx.</Table.HeaderCell>
          <Table.HeaderCell width={3}>장비 목록</Table.HeaderCell>
          <Table.HeaderCell width={2}>사용자</Table.HeaderCell>
          <Table.HeaderCell>예약 제목</Table.HeaderCell>
          <Table.HeaderCell width={4}>예약 기간</Table.HeaderCell>
          <Table.HeaderCell width={2}>상태</Table.HeaderCell>
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

          return (
            <Table.Row
              key={reservation.uuid}
              negative={isOutdated}
              positive={isNow}
            >
              <Table.Cell>{startIdx + idx + 1}</Table.Cell>
              <Table.Cell>
                {reservation.equipments.map((equipment) => (
                  <Label
                    size={'tiny'}
                    key={equipment.uuid}
                    style={{ margin: '2px' }}
                  >
                    {equipment.name}
                  </Label>
                ))}
              </Table.Cell>
              <Table.Cell>{reservation.booker.name}</Table.Cell>
              <EquipmentReservationConfirmModal
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
              </Table.Cell>
              <Table.Cell>{reservation.status}</Table.Cell>
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
          <Table.HeaderCell colSpan={7}>{bulkActionPanel}</Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default EquipmentReservationWaitTable;
