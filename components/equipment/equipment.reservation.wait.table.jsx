import React from 'react';
import { Label, Table } from 'semantic-ui-react';
import moment from 'moment';
import EquipmentReservationConfirmModal from './equipment.reservation.confirm.modal';

const EquipmentReservationWaitTable = ({ reservations, startIdx }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={1}>idx.</Table.HeaderCell>
          <Table.HeaderCell width={3}>장비 목록</Table.HeaderCell>
          <Table.HeaderCell width={2}>사용자</Table.HeaderCell>
          <Table.HeaderCell>예약 제목</Table.HeaderCell>
          <Table.HeaderCell width={4}>예약 기간</Table.HeaderCell>
          <Table.HeaderCell width={2}>상태</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {reservations.map((reservation, idx) => {
          const start_datetime = moment(
            `${reservation.date} ${reservation.start_time}`,
            'YYYYMMDD HHmm',
          );
          const end_datetime = moment(
            `${reservation.date} ${reservation.end_time}`,
            'YYYYMMDD HHmm',
          );

          const isOutdated = moment() > end_datetime;
          const isNow = start_datetime <= moment() && moment() <= end_datetime;

          return (
            <EquipmentReservationConfirmModal
              key={reservation.uuid}
              reservation={reservation}
              trigger={
                <Table.Row
                  key={reservation.uuid}
                  negative={isOutdated}
                  positive={isNow}
                >
                  <Table.Cell>{startIdx + idx + 1}</Table.Cell>
                  <Table.Cell>
                    {reservation.equipments.map((equipment) => {
                      return (
                        <Label
                          size={'tiny'}
                          key={equipment.uuid}
                          style={{ margin: '2px' }}
                        >
                          {equipment.name}
                        </Label>
                      );
                    })}
                  </Table.Cell>
                  <Table.Cell>{reservation.booker.name}</Table.Cell>
                  <Table.Cell>{reservation.title}</Table.Cell>
                  <Table.Cell>
                    <b>
                      {moment(reservation.date, 'YYYYMMDD').format(
                        'YYYY년 MM월 DD일',
                      )}
                      <br />
                      {moment(reservation.start_time, 'HHmm').format('HH:mm')}
                      &nbsp;~&nbsp;
                      {moment(reservation.end_time, 'HHmm').format('HH:mm')}
                    </b>
                  </Table.Cell>
                  <Table.Cell>{reservation.status}</Table.Cell>
                </Table.Row>
              }
            />
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default EquipmentReservationWaitTable;
