import React from 'react';
import { Table } from 'semantic-ui-react';
import moment from 'moment';

const PlaceReservationTable2 = ({ reservations, startIdx }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={1}>idx.</Table.HeaderCell>
          <Table.HeaderCell width={3}>장소명</Table.HeaderCell>
          <Table.HeaderCell>예약 제목</Table.HeaderCell>
          <Table.HeaderCell>예약 설명</Table.HeaderCell>
          <Table.HeaderCell width={4}>예약 기간</Table.HeaderCell>
          <Table.HeaderCell width={2}>상태</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {reservations.map((reservation, idx) => (
          <Table.Row key={reservation.uuid}>
            <Table.Cell>{startIdx + idx + 1}</Table.Cell>
            <Table.Cell>{reservation.place.name}</Table.Cell>
            <Table.Cell>{reservation.title}</Table.Cell>
            <Table.Cell>{reservation.description}</Table.Cell>
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
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default PlaceReservationTable2;
