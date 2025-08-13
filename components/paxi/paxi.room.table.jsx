import React from 'react';
import { Table } from 'semantic-ui-react';

// Paxi에서 사용하는 방 및 유저 상태
const RoomStatus = {
  ACTIVE: 'ACTIVE', // 모집 중 및 정산 신청 전까지
  IN_SETTLEMENT: 'IN_SETTLEMENT', // 정산 신청 후 정산 중
  COMPLETED: 'COMPLETED', // 정산 완료
  DELETED: 'DELETED', // 방장이 삭제한 방
};

const RoomUserStatus = {
  JOINED: 'JOINED', // 가입 완료
  KICKED: 'KICKED', // 강퇴됨
};

const PaxiRoomTable = ({ rooms, startIdx = 1 }) => {
  const getStatusText = (status) => {
    switch (status) {
      case RoomStatus.ACTIVE:
        return '출발 전';
      case RoomStatus.IN_SETTLEMENT:
        return '정산 중';
      case RoomStatus.COMPLETED:
        return '정산 완료';
      case RoomStatus.DELETED:
        return '삭제됨';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case RoomStatus.ACTIVE:
        return 'blue';
      case RoomStatus.IN_SETTLEMENT:
        return 'orange';
      case RoomStatus.COMPLETED:
        return 'green';
      case RoomStatus.DELETED:
        return 'red';
      default:
        return 'grey';
    }
  };

  const getUserStatusText = (userStatus) => {
    switch (userStatus) {
      case RoomUserStatus.JOINED:
        return '참여 중';
      case RoomUserStatus.KICKED:
        return '추방됨';
      default:
        return userStatus;
    }
  };

  const getUserStatusColor = (userStatus) => {
    switch (userStatus) {
      case RoomUserStatus.JOINED:
        return 'green';
      case RoomUserStatus.KICKED:
        return 'red';
      default:
        return 'grey';
    }
  };

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>번호</Table.HeaderCell>
          <Table.HeaderCell>방 이름</Table.HeaderCell>
          <Table.HeaderCell>출발지</Table.HeaderCell>
          <Table.HeaderCell>도착지</Table.HeaderCell>
          <Table.HeaderCell>인원</Table.HeaderCell>
          <Table.HeaderCell>출발 시각</Table.HeaderCell>
          <Table.HeaderCell>방 상태</Table.HeaderCell>
          <Table.HeaderCell>참여 상태</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rooms.map((room, index) => (
          <Table.Row key={room.uuid}>
            <Table.Cell>{startIdx + index}</Table.Cell>
            <Table.Cell>{room.title}</Table.Cell>
            <Table.Cell>{room.departureLocation}</Table.Cell>
            <Table.Cell>{room.destinationLocation}</Table.Cell>
            <Table.Cell>
              {room.currentParticipant}/{room.maxParticipant}
            </Table.Cell>
            <Table.Cell>
              {room.departureTime
                ? new Date(room.departureTime).toLocaleString('ko-KR')
                : '-'}
            </Table.Cell>
            <Table.Cell>
              <span style={{ color: getStatusColor(room.status) }}>
                {getStatusText(room.status)}
              </span>
            </Table.Cell>
            <Table.Cell>
              <span style={{ color: getUserStatusColor(room.userStatus) }}>
                {getUserStatusText(room.userStatus)}
              </span>
              {room.userStatus === RoomUserStatus.KICKED &&
                room.kickedReason && (
                  <div
                    style={{
                      fontSize: '0.8em',
                      color: 'red',
                      marginTop: '2px',
                    }}
                  >
                    사유: {room.kickedReason}
                  </div>
                )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default PaxiRoomTable;
