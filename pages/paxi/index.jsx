import { useEffect, useState } from 'react';
import { Table, Message, Modal, Form, Button } from 'semantic-ui-react';
import LayoutWithAuth from '@/components/layout/layout.auth.with';
import { PaxiAxios } from '@/utils/axios.instance';
import moment from 'moment';

// Paxi에서 사용하는 방 상태
const RoomStatus = {
  ACTIVE: 'ACTIVE', // 출발 전
  IN_SETTLEMENT: 'IN_SETTLEMENT', // 정산 중
  COMPLETED: 'COMPLETED', // 정산 완료
  DELETED: 'DELETED', // 삭제됨
};

// Paxi에서 사용하는 방 유저 상태
const RoomUserStatus = {
  JOINED: 'JOINED', // 참여 중
  KICKED: 'KICKED', // 강퇴됨
};

const PaxiManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 상세 정보 모달 관련 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetail, setRoomDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 수정 모달 관련 상태
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

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

  // 모든 카풀 방 조회
  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await PaxiAxios.get('/room', {
        params: {
          all: true,
        },
      });
      setRooms(response.data || []);
    } catch (err) {
      console.error('카풀 방 조회 실패:', err);
      setError('카풀 방 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 특정 방의 상세 정보 조회
  const fetchRoomDetail = async (roomUuid) => {
    try {
      setDetailLoading(true);
      const response = await PaxiAxios.get(`/room/${roomUuid}`);
      setRoomDetail(response.data);
    } catch (err) {
      console.error('방 상세 정보 조회 실패:', err);
      alert('방 상세 정보를 불러오는데 실패했습니다.');
    } finally {
      setDetailLoading(false);
    }
  };

  // 행 클릭 핸들러
  const handleRowClick = async (room) => {
    setSelectedRoom(room);
    setDetailModalOpen(true);
    await fetchRoomDetail(room.uuid);
  };

  // 수정 모달 열기
  const handleEditClick = () => {
    if (!roomDetail) return;

    setEditForm({
      title: roomDetail.title || '',
      description: roomDetail.description || '',
      departureTime: roomDetail.departureTime
        ? moment(roomDetail.departureTime).format('YYYY-MM-DDTHH:mm')
        : '',
      departureLocation: roomDetail.departureLocation || '',
      destinationLocation: roomDetail.destinationLocation || '',
      maxParticipant: roomDetail.maxParticipant || 1,
    });
    setEditModalOpen(true);
  };

  // 수정 제출
  const handleEditSubmit = () => {
    setEditModalOpen(false);
    setConfirmModalOpen(true);
  };

  // 수정 확인
  const handleConfirmEdit = async () => {
    if (!selectedRoom) return;

    setEditLoading(true);
    setEditError('');

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
      setEditModalOpen(false);
      setDetailModalOpen(false);
      setSelectedRoom(null);
      setEditForm({});

      // 목록 새로고침
      await fetchRooms();
    } catch (err) {
      setEditError('방 정보 수정에 실패했습니다.');
      console.error('방 정보 수정 오류:', err);
    } finally {
      setEditLoading(false);
    }
  };

  // 수정 취소
  const handleCancelEdit = () => {
    setConfirmModalOpen(false);
    setEditModalOpen(false);
    setSelectedRoom(null);
    setEditForm({});
    setEditError('');
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <LayoutWithAuth>
      <h2>카풀 방 내역</h2>

      {error && (
        <Message negative>
          <Message.Header>오류</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {isLoading ? (
        <div>카풀 방 목록을 불러오는 중...</div>
      ) : (
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
              <Table.HeaderCell>방장 UUID</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rooms.map((room, index) => (
              <Table.Row
                key={room.uuid}
                onClick={() => handleRowClick(room)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>{index + 1}</Table.Cell>
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
                  <span style={{ fontSize: '0.8em', fontFamily: 'monospace' }}>
                    {room.ownerUuid}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {!isLoading && rooms.length === 0 && (
        <Message info>
          <Message.Header>카풀 방이 없습니다</Message.Header>
          <p>현재 등록된 카풀 방이 없습니다.</p>
        </Message>
      )}

      {/* 상세 정보 모달 */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        size="large"
      >
        <Modal.Header>방 상세 정보</Modal.Header>
        <Modal.Content>
          {detailLoading ? (
            <div>상세 정보를 불러오는 중...</div>
          ) : roomDetail ? (
            <div>
              <h3>방 정보</h3>
              <Table celled>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      방 UUID
                    </Table.Cell>
                    <Table.Cell style={{ fontFamily: 'monospace' }}>
                      {roomDetail.uuid}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>제목</Table.Cell>
                    <Table.Cell>{roomDetail.title}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>설명</Table.Cell>
                    <Table.Cell>{roomDetail.description || '-'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      출발 시각
                    </Table.Cell>
                    <Table.Cell>
                      {roomDetail.departureTime
                        ? new Date(roomDetail.departureTime).toLocaleString(
                            'ko-KR',
                          )
                        : '-'}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      출발지
                    </Table.Cell>
                    <Table.Cell>{roomDetail.departureLocation}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      도착지
                    </Table.Cell>
                    <Table.Cell>{roomDetail.destinationLocation}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      최대 인원
                    </Table.Cell>
                    <Table.Cell>{roomDetail.maxParticipant}명</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      현재 인원
                    </Table.Cell>
                    <Table.Cell>{roomDetail.currentParticipant}명</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      방 상태
                    </Table.Cell>
                    <Table.Cell>
                      <span
                        style={{ color: getStatusColor(roomDetail.status) }}
                      >
                        {getStatusText(roomDetail.status)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      방장 UUID
                    </Table.Cell>
                    <Table.Cell style={{ fontFamily: 'monospace' }}>
                      {roomDetail.ownerUuid}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      생성일
                    </Table.Cell>
                    <Table.Cell>
                      {roomDetail.createdAt
                        ? new Date(roomDetail.createdAt).toLocaleString('ko-KR')
                        : '-'}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>

              <h3 style={{ marginTop: '2rem' }}>정산 정보</h3>
              <Table celled style={{ marginLeft: '0' }}>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      결제자 UUID
                    </Table.Cell>
                    <Table.Cell style={{ fontFamily: 'monospace' }}>
                      {roomDetail.payerUuid || '-'}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      결제 금액
                    </Table.Cell>
                    <Table.Cell>
                      {roomDetail.payAmount
                        ? `${roomDetail.payAmount.toLocaleString()}원`
                        : '-'}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      은행명
                    </Table.Cell>
                    <Table.Cell>{roomDetail.payerBankName || '-'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      계좌주명
                    </Table.Cell>
                    <Table.Cell>
                      {roomDetail.payerAccountHolderName || '-'}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>

              {roomDetail.room_users && roomDetail.room_users.length > 0 && (
                <>
                  <h3 style={{ marginTop: '2rem' }}>참여자 목록</h3>
                  <Table celled>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell>닉네임</Table.HeaderCell>
                        <Table.HeaderCell>UUID</Table.HeaderCell>
                        <Table.HeaderCell>상태</Table.HeaderCell>
                        <Table.HeaderCell>결제 여부</Table.HeaderCell>
                        <Table.HeaderCell>음소거 여부</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {roomDetail.room_users.map((user) => (
                        <Table.Row key={user.userUuid}>
                          <Table.Cell>{user.nickname}</Table.Cell>
                          <Table.Cell style={{ fontFamily: 'monospace' }}>
                            {user.userUuid}
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              style={{ color: getUserStatusColor(user.status) }}
                            >
                              {getUserStatusText(user.status)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              style={{ color: user.isPaid ? 'green' : 'red' }}
                            >
                              {user.isPaid ? 'O' : 'X'}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            <span
                              style={{
                                color: user.isMuted ? 'orange' : 'green',
                              }}
                            >
                              {user.isMuted ? 'O' : 'X'}
                            </span>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                </>
              )}
            </div>
          ) : (
            <div>상세 정보를 불러올 수 없습니다.</div>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
          <Button primary onClick={handleEditClick}>
            수정하기
          </Button>
        </Modal.Actions>
      </Modal>

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
          {editError && (
            <Message negative>
              <Message.Header>오류</Message.Header>
              <p>{editError}</p>
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
          <Button onClick={handleCancelEdit} disabled={editLoading}>
            취소
          </Button>
          <Button primary onClick={handleConfirmEdit} loading={editLoading}>
            확인
          </Button>
        </Modal.Actions>
      </Modal>
    </LayoutWithAuth>
  );
};

export default PaxiManagementPage;
