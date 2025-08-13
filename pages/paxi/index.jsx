import { useEffect, useState } from 'react';
import { Table, Message } from 'semantic-ui-react';
import LayoutWithAuth from '@/components/layout/layout.auth.with';
import { PaxiAxios } from '@/utils/axios.instance';

// Paxi에서 사용하는 방 상태
const RoomStatus = {
  ACTIVE: 'ACTIVE', // 출발 전
  IN_SETTLEMENT: 'IN_SETTLEMENT', // 정산 중
  COMPLETED: 'COMPLETED', // 정산 완료
  DELETED: 'DELETED', // 삭제됨
};

const PaxiManagementPage = () => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        <Table celled>
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
              <Table.HeaderCell>정산 정보</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {rooms.map((room, index) => (
              <Table.Row key={room.uuid}>
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
                <Table.Cell>
                  {room.payerUuid ? (
                    <div>
                      <div>결제자: {room.payerUuid}</div>
                      <div>금액: {room.payAmount?.toLocaleString()}원</div>
                      {room.payerBankName && (
                        <div>은행: {room.payerBankName}</div>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>정산 정보 없음</span>
                  )}
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
    </LayoutWithAuth>
  );
};

export default PaxiManagementPage;
