import React, { useState } from 'react';
import { Table, Modal, Form, Button, Message } from 'semantic-ui-react';
import { PaxiAxios } from '@/utils/axios.instance';

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleRowClick = (room) => {
    setSelectedRoom(room);
    setEditForm({
      title: room.title || '',
      description: room.description || '',
      departureTime: room.departureTime
        ? new Date(room.departureTime).toISOString().slice(0, 16)
        : '',
      departureLocation: room.departureLocation || '',
      destinationLocation: room.destinationLocation || '',
      maxParticipant: room.maxParticipant || 1,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    setEditModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    setIsLoading(true);
    setError('');

    try {
      // 빈 값이 아닌 필드만 포함
      const updateData = {};
      Object.keys(editForm).forEach((key) => {
        if (
          editForm[key] !== '' &&
          editForm[key] !== null &&
          editForm[key] !== undefined
        ) {
          updateData[key] = editForm[key];
        }
      });

      await PaxiAxios.patch(`/room/${selectedRoom.uuid}`, updateData);

      alert('방 정보가 성공적으로 수정되었습니다.');
      setConfirmModalOpen(false);
      setSelectedRoom(null);
      setEditForm({});

      // 페이지 새로고침으로 업데이트된 데이터 반영
      window.location.reload();
    } catch (err) {
      setError('방 정보 수정에 실패했습니다.');
      console.error('방 정보 수정 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setConfirmModalOpen(false);
    setSelectedRoom(null);
    setEditForm({});
    setError('');
  };

  return (
    <>
      <Table celled selectable>
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
            <Table.Row
              key={room.uuid}
              onClick={() => handleRowClick(room)}
              style={{ cursor: 'pointer' }}
            >
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

      {/* 방 정보 수정 모달 */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        size="small"
      >
        <Modal.Header>방 정보 수정</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>방 이름</label>
              <Form.Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm({ ...editForm, title: e.target.value })
                }
                placeholder="방 이름을 입력하세요"
              />
            </Form.Field>
            <Form.Field>
              <label>설명</label>
              <Form.TextArea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
                placeholder="방 설명을 입력하세요"
                rows={3}
              />
            </Form.Field>
            <Form.Field>
              <label>출발 시각</label>
              <Form.Input
                type="datetime-local"
                value={editForm.departureTime}
                onChange={(e) =>
                  setEditForm({ ...editForm, departureTime: e.target.value })
                }
              />
            </Form.Field>
            <Form.Field>
              <label>출발지</label>
              <Form.Input
                value={editForm.departureLocation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    departureLocation: e.target.value,
                  })
                }
                placeholder="출발지를 입력하세요"
              />
            </Form.Field>
            <Form.Field>
              <label>도착지</label>
              <Form.Input
                value={editForm.destinationLocation}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    destinationLocation: e.target.value,
                  })
                }
                placeholder="도착지를 입력하세요"
              />
            </Form.Field>
            <Form.Field>
              <label>최대 인원</label>
              <Form.Input
                type="number"
                min="1"
                value={editForm.maxParticipant}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    maxParticipant: parseInt(e.target.value),
                  })
                }
                placeholder="최대 인원을 입력하세요"
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setEditModalOpen(false)}>취소</Button>
          <Button primary onClick={handleEditSubmit}>
            수정하기
          </Button>
        </Modal.Actions>
      </Modal>

      {/* 재확인 모달 */}
      <Modal open={confirmModalOpen} onClose={handleCancelEdit} size="tiny">
        <Modal.Header>방 정보 수정 확인</Modal.Header>
        <Modal.Content>
          {error && (
            <Message negative>
              <Message.Header>오류</Message.Header>
              <p>{error}</p>
            </Message>
          )}
          <p>다음과 같이 방 정보를 수정하시겠습니까?</p>
          <div style={{ marginTop: '1rem' }}>
            <p>
              <strong>방 이름:</strong> {editForm.title}
            </p>
            <p>
              <strong>설명:</strong> {editForm.description || '-'}
            </p>
            <p>
              <strong>출발 시각:</strong>{' '}
              {editForm.departureTime
                ? new Date(editForm.departureTime).toLocaleString('ko-KR')
                : '-'}
            </p>
            <p>
              <strong>출발지:</strong> {editForm.departureLocation}
            </p>
            <p>
              <strong>도착지:</strong> {editForm.destinationLocation}
            </p>
            <p>
              <strong>최대 인원:</strong> {editForm.maxParticipant}명
            </p>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleCancelEdit} disabled={isLoading}>
            취소
          </Button>
          <Button primary onClick={handleConfirmEdit} loading={isLoading}>
            확인
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default PaxiRoomTable;
