import React, { useState } from 'react';
import { Checkbox, Table, Button } from 'semantic-ui-react';
import moment from 'moment';
import PlaceReservationConfirmModal from './place.reservation.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';

const PlaceReservationWaitTable = ({ reservations }) => {
  const [selectedUuidList, setSelectedUuidList] = useState([]);

  function acceptAllInProgressPlaceReservations() {
    PoPoAxios.patch('/reservation-place/all/status/accept', {
      uuidList: selectedUuidList,
    })
      .then(() => {
        alert(`${selectedUuidList.length}개 장소 예약을 일괄 승인했습니다.`);
        window.location.reload();
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`전체 예약 승인에 실패했습니다.\n${errMsg}`);
      });
  }

  function handleCheck(newUuid) {
    const currentList = selectedUuidList;
    const isTargetSelected = currentList.includes(newUuid);

    const newList = isTargetSelected
      ? currentList.filter((uuid) => uuid !== newUuid)
      : currentList.concat(newUuid);

    setSelectedUuidList(newList);
  }

  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell colSpan={6}>
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
                일괄 처리 도중 예약 Overlap이 발생하면, 처리가 중단 됩니다.
                <br />
                일괄 예약 승인 때는 승인 메일을 보내지 않습니다.
                <br />
              </p>
              <div>
                <Button
                  positive
                  size="small"
                  floated="right"
                  onClick={acceptAllInProgressPlaceReservations}
                >
                  예약 일괄 승인
                </Button>
              </div>
            </div>
          </Table.HeaderCell>
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

          return (
            <Table.Row
              key={reservation.uuid}
              negative={isOutdated}
              positive={isNow}
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
              </Table.Cell>
              <Table.Cell>
                <Checkbox onClick={() => handleCheck(reservation.uuid)} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>

      <Table.Footer fullWidth>
        <Table.Row>
          <Table.HeaderCell colSpan={6}>
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
                일괄 처리 도중 예약 Overlap이 발생하면, 처리가 중단 됩니다.
                <br />
                일괄 예약 승인 때는 승인 메일을 보내지 않습니다.
                <br />
              </p>
              <div>
                <Button
                  positive
                  size="small"
                  floated="right"
                  onClick={acceptAllInProgressPlaceReservations}
                >
                  예약 일괄 승인
                </Button>
              </div>
            </div>
          </Table.HeaderCell>
        </Table.Row>
      </Table.Footer>
    </Table>
  );
};

export default PlaceReservationWaitTable;
