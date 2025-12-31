import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Button, Message } from 'semantic-ui-react';
import { PaxiAxios } from '@/utils/axios.instance';
import moment from 'moment';

// Paxi에서 사용하는 방 및 유저 상태
const RoomStatus = {
  ACTIVE: 'ACTIVE', // 출발 전
  IN_SETTLEMENT: 'IN_SETTLEMENT', // 정산 중
  COMPLETED: 'COMPLETED', // 정산 완료
  DELETED: 'DELETED', // 삭제됨
};

const RoomUserStatus = {
  JOINED: 'JOINED', // 참여 중
  KICKED: 'KICKED', // 강퇴됨
};

const PaxiRoomTable = ({ rooms, startIdx = 1, userUuid }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatuses, setPaymentStatuses] = useState({});
  const [kickReasonModalOpen, setKickReasonModalOpen] = useState(false);
  const [selectedKickReason, setSelectedKickReason] = useState('');

  // 방 상태에 따른 텍스트 반환
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
        return '알 수 없음';
    }
  };

  // 방 상태에 따른 색상 반환
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

  // 사용자 상태에 따른 텍스트 반환
  const getUserStatusText = (status) => {
    switch (status) {
      case RoomUserStatus.JOINED:
        return '참여 중';
      case RoomUserStatus.KICKED:
        return '추방됨';
      default:
        return '알 수 없음';
    }
  };

  // 사용자 상태에 따른 색상 반환
  const getUserStatusColor = (status) => {
    switch (status) {
      case RoomUserStatus.JOINED:
        return 'green';
      case RoomUserStatus.KICKED:
        return 'red';
      default:
        return 'grey';
    }
  };

  // 정산 여부 조회
  const fetchPaymentStatus = async (roomUuid, userUuid) => {
    try {
      const response = await PaxiAxios.get(`/room/${roomUuid}/pay/${userUuid}`);
      return response.data.isPaid;
    } catch (error) {
      console.error('정산 여부 조회 실패:', error);
      return false;
    }
  };

  // 모든 방의 정산 여부 조회
  const fetchAllPaymentStatuses = async () => {
    const statuses = {};

    for (const room of rooms) {
      const isPaid = await fetchPaymentStatus(room.uuid, userUuid);
      statuses[room.uuid] = isPaid;
    }

    setPaymentStatuses(statuses);
  };

  // 컴포넌트 마운트 시 정산 여부 조회
  useEffect(() => {
    if (rooms && rooms.length > 0 && userUuid) {
      fetchAllPaymentStatuses();
    }
  }, [rooms, userUuid]);

  const handleRowClick = (room) => {
    setSelectedRoom(room);
    setEditForm({
      title: room.title || '',
      description: room.description || '',
      departureTime: room.departureTime
        ? moment(room.departureTime).format('YYYY-MM-DDTHH:mm')
        : '',
      departureLocation: room.departureLocation || '',
      destinationLocation: room.destinationLocation || '',
      maxParticipant: room.maxParticipant || 1,
    });
    setEditModalOpen(true);
  };

  // 추방 사유 클릭 핸들러
  const handleKickReasonClick = (e, room) => {
    e.stopPropagation(); // 행 클릭 이벤트 전파 방지
    if (room.userStatus === RoomUserStatus.KICKED && room.kickedReason) {
      setSelectedKickReason(room.kickedReason);
      setKickReasonModalOpen(true);
    }
  };

  const handleEditSubmit = () => {
    setEditModalOpen(false);
    setConfirmModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!window.confirm('정말로 방 정보를 변경하시겠습니까?')) {
      return;
    }

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
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        '방 정보 수정에 실패했습니다.';
      setError(errorMessage);
      console.error('방 정보 수정 오류:', err);
      alert(`방 정보 수정 실패: ${errorMessage}`);
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
            <Table.HeaderCell>방 정보</Table.HeaderCell>
            <Table.HeaderCell>출발 시각</Table.HeaderCell>
            <Table.HeaderCell>출발지</Table.HeaderCell>
            <Table.HeaderCell>도착지</Table.HeaderCell>
            <Table.HeaderCell>인원</Table.HeaderCell>
            <Table.HeaderCell>방 상태</Table.HeaderCell>
            <Table.HeaderCell>참여 상태</Table.HeaderCell>
            <Table.HeaderCell>정산 여부</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {rooms.map((room, index) => {
            const isPaid = paymentStatuses[room.uuid];

            return (
              <Table.Row
                key={room.uuid}
                onClick={() => handleRowClick(room)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>{startIdx + index}</Table.Cell>
                <Table.Cell>
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {room.title}
                    </div>
                    {room.description && (
                      <div style={{ fontSize: '0.9em', color: '#666' }}>
                        {room.description}
                      </div>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {room.departureTime
                    ? new Date(room.departureTime).toLocaleString('ko-KR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-'}
                </Table.Cell>
                <Table.Cell>{room.departureLocation}</Table.Cell>
                <Table.Cell>{room.destinationLocation}</Table.Cell>
                <Table.Cell>
                  {room.currentParticipant}/{room.maxParticipant}명
                </Table.Cell>
                <Table.Cell>
                  <span style={{ color: getStatusColor(room.status) }}>
                    {getStatusText(room.status)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span
                    style={{
                      color: getUserStatusColor(room.userStatus),
                      cursor:
                        room.userStatus === RoomUserStatus.KICKED &&
                        room.kickedReason
                          ? 'pointer'
                          : 'default',
                      textDecoration:
                        room.userStatus === RoomUserStatus.KICKED &&
                        room.kickedReason
                          ? 'underline'
                          : 'none',
                    }}
                    onClick={(e) => handleKickReasonClick(e, room)}
                    title={
                      room.userStatus === RoomUserStatus.KICKED &&
                      room.kickedReason
                        ? '클릭하여 추방 사유 확인'
                        : ''
                    }
                  >
                    {getUserStatusText(room.userStatus)}
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <span
                    style={{
                      color: isPaid ? 'green' : 'red',
                    }}
                  >
                    {isPaid ? 'O' : 'X'}
                  </span>
                </Table.Cell>
              </Table.Row>
            );
          })}
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
                    maxParticipant: parseInt(e.target.value, 10),
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

      {/* 추방 사유 모달 */}
      <Modal
        open={kickReasonModalOpen}
        onClose={() => setKickReasonModalOpen(false)}
        size="tiny"
      >
        <Modal.Header>추방 사유</Modal.Header>
        <Modal.Content>
          <p>{selectedKickReason}</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setKickReasonModalOpen(false)}>확인</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default PaxiRoomTable;
