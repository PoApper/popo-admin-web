import { useEffect, useState } from 'react';
import {
  Table,
  Message,
  Dropdown,
  Button,
  Modal,
  Form,
  Icon,
  Popup,
} from 'semantic-ui-react';
import PaxiLayout from '@/components/paxi/paxi.layout';
import { PaxiAxios } from '@/utils/axios.instance';

// 신고 상태 enum
const ReportStatus = {
  PENDING: 'PENDING', // 신고 대기 중
  COMPLETED: 'COMPLETED', // 신고 처리 완료
};

const PaxiReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(ReportStatus.PENDING);
  const [filteredReports, setFilteredReports] = useState([]);

  // 상세 정보 모달 관련 상태
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [resolutionLoading, setResolutionLoading] = useState(false);
  const [resolutionError, setResolutionError] = useState('');

  // 채팅 보기 관련 상태
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatHasMore, setChatHasMore] = useState(true);

  const sortMessagesAsc = (list) =>
    [...list].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );

  const fetchChatMessages = async (
    roomUuid,
    before = null,
    take = 30,
    append = false,
    currentList = [],
  ) => {
    setChatLoading(true);
    setChatError('');
    try {
      const res = await PaxiAxios.get(`/chat/${roomUuid}`, {
        params: { before, take },
      });
      const data = res.data || [];
      const merged = append ? [...data, ...currentList] : data;
      setChatMessages(sortMessagesAsc(merged));
      setChatHasMore(data.length === take);
    } catch (err) {
      console.error('채팅 조회 실패:', err);
      setChatError('채팅을 불러오는데 실패했습니다.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenChatModal = async () => {
    if (!selectedReport?.targetRoomUuid) return;
    setChatModalOpen(true);
    setChatMessages([]);
    await fetchChatMessages(selectedReport.targetRoomUuid, null, 30, false, []);
  };

  const handleLoadOlderMessages = async () => {
    if (!selectedReport?.targetRoomUuid || chatMessages.length === 0) return;
    const oldest = chatMessages[0];
    await fetchChatMessages(
      selectedReport.targetRoomUuid,
      oldest.uuid,
      30,
      true,
      chatMessages,
    );
  };

  // 신고 상태에 따른 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return '대기 중';
      case ReportStatus.COMPLETED:
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  // 신고 상태에 따른 색상 반환
  const getStatusColor = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'orange';
      case ReportStatus.COMPLETED:
        return 'green';
      default:
        return 'grey';
    }
  };

  // 모든 신고 조회
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await PaxiAxios.get('/report');
      setReports(response.data || []);
    } catch (err) {
      console.error('신고 조회 실패:', err);
      setError('신고 목록을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 상태별 필터링
  useEffect(() => {
    const filtered = reports.filter(
      (report) => report.status === selectedStatus,
    );
    setFilteredReports(filtered);
  }, [reports, selectedStatus]);

  // 행 클릭 핸들러
  const handleRowClick = (report) => {
    setSelectedReport(report);
    setResolutionMessage('');
    setResolutionError('');
    setDetailModalOpen(true);
  };

  // 신고 처리 핸들러
  const handleResolveReport = async () => {
    if (!selectedReport) return;

    setResolutionLoading(true);
    setResolutionError('');

    try {
      await PaxiAxios.put(`/report/${selectedReport.id}/resolve`, {
        resolutionMessage: resolutionMessage.trim(),
      });

      alert('신고가 성공적으로 처리되었습니다.');
      setDetailModalOpen(false);
      setSelectedReport(null);
      setResolutionMessage('');

      // 목록 새로고침
      await fetchReports();
    } catch (err) {
      console.error('신고 처리 실패:', err);
      setResolutionError(
        err.response?.data?.message || '신고 처리 중 오류가 발생했습니다.',
      );
    } finally {
      setResolutionLoading(false);
    }
  };

  // 상태 필터 옵션
  const statusOptions = [
    { key: ReportStatus.PENDING, text: '대기 중', value: ReportStatus.PENDING },
    {
      key: ReportStatus.COMPLETED,
      text: '완료',
      value: ReportStatus.COMPLETED,
    },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <PaxiLayout>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h3>신고 처리</h3>
        <Popup
          trigger={
            <Icon
              name="question circle"
              style={{
                cursor: 'default',
                color: '#666',
                fontSize: '1.1em',
                marginLeft: '-3px',
                marginBottom: '13px',
                verticalAlign: 'middle',
              }}
            />
          }
          content={
            <div style={{ maxWidth: '300px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                신고 처리 가이드
              </p>
              <p style={{ margin: '0', fontSize: '0.9em', lineHeight: '1.4' }}>
                신고자 및 피신고자 이메일로 연락 후 경위를 조사합니다. 중재를
                하거나 과한 경우라면 패널티를 부여할 수 있습니다. <br /> 패널티
                내용은 추후 논의가 필요합니다.
              </p>
            </div>
          }
          position="bottom left"
          size="small"
        />
      </div>

      {error && (
        <Message negative>
          <Message.Header>오류</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <Dropdown
          selection
          options={statusOptions}
          value={selectedStatus}
          onChange={(e, { value }) => setSelectedStatus(value)}
          placeholder="상태 선택"
        />
      </div>

      {isLoading ? (
        <div>신고 목록을 불러오는 중...</div>
      ) : (
        <Table celled selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>번호</Table.HeaderCell>
              <Table.HeaderCell>신고자</Table.HeaderCell>
              <Table.HeaderCell>신고 대상</Table.HeaderCell>
              <Table.HeaderCell>신고 사유</Table.HeaderCell>
              <Table.HeaderCell>신고일</Table.HeaderCell>
              <Table.HeaderCell>상태</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {filteredReports.map((report, index) => (
              <Table.Row
                key={report.id}
                onClick={() => handleRowClick(report)}
                style={{ cursor: 'pointer' }}
              >
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>
                  <div style={{ fontWeight: 'bold' }}>
                    {report.reporterNickname}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div style={{ fontWeight: 'bold' }}>
                    {report.targetUserNickname ||
                      report.targetRoomName ||
                      '기타'}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <div
                    style={{
                      maxWidth: '200px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {report.reason || '-'}
                  </div>
                </Table.Cell>
                <Table.Cell>
                  {report.createdAt
                    ? new Date(report.createdAt).toLocaleString('ko-KR')
                    : '-'}
                </Table.Cell>
                <Table.Cell>
                  <span style={{ color: getStatusColor(report.status) }}>
                    {getStatusText(report.status)}
                  </span>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {!isLoading && filteredReports.length === 0 && (
        <Message info>
          <Message.Header>신고가 없습니다</Message.Header>
          <p>선택한 상태의 신고가 없습니다.</p>
        </Message>
      )}

      {/* 신고 상세 정보 모달 */}
      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        size="large"
      >
        <Modal.Header>신고 상세 정보</Modal.Header>
        <Modal.Content>
          {selectedReport ? (
            <div>
              <h3>신고 정보</h3>
              <Table celled>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      신고 ID
                    </Table.Cell>
                    <Table.Cell>{selectedReport.id}</Table.Cell>
                  </Table.Row>
                  {(selectedReport.targetRoomName ||
                    selectedReport.targetRoomUuid) && (
                    <Table.Row>
                      <Table.Cell style={{ fontWeight: 'bold' }}>
                        방 정보
                      </Table.Cell>
                      <Table.Cell>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>
                            {selectedReport.targetRoomName || '-'}
                          </div>
                          {selectedReport.targetRoomUuid && (
                            <div style={{ fontSize: '0.7em', color: '#999' }}>
                              {selectedReport.targetRoomUuid}
                            </div>
                          )}
                          {selectedReport.targetRoomUuid && (
                            <div style={{ marginTop: '8px' }}>
                              <Button size="tiny" onClick={handleOpenChatModal}>
                                채팅 보기
                              </Button>
                            </div>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  )}
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      신고자
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {selectedReport.reporterNickname}
                        </div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                          {selectedReport.reporterEmail}
                        </div>
                        <div style={{ fontSize: '0.7em', color: '#999' }}>
                          {selectedReport.reporterUuid}
                        </div>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      신고 대상
                    </Table.Cell>
                    <Table.Cell>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>
                          {selectedReport.targetUserNickname ||
                            selectedReport.targetRoomName ||
                            '기타'}
                        </div>
                        {selectedReport.targetUserEmail && (
                          <div style={{ fontSize: '0.8em', color: '#666' }}>
                            {selectedReport.targetUserEmail}
                          </div>
                        )}
                        <div style={{ fontSize: '0.7em', color: '#999' }}>
                          {selectedReport.targetUserUuid ||
                            selectedReport.targetRoomUuid}
                        </div>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      신고 사유
                    </Table.Cell>
                    <Table.Cell>{selectedReport.reason || '-'}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      신고일
                    </Table.Cell>
                    <Table.Cell>
                      {selectedReport.createdAt
                        ? new Date(selectedReport.createdAt).toLocaleString(
                            'ko-KR',
                          )
                        : '-'}
                    </Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell style={{ fontWeight: 'bold' }}>상태</Table.Cell>
                    <Table.Cell>
                      <span
                        style={{ color: getStatusColor(selectedReport.status) }}
                      >
                        {getStatusText(selectedReport.status)}
                      </span>
                    </Table.Cell>
                  </Table.Row>
                  {selectedReport.status === ReportStatus.COMPLETED && (
                    <>
                      <Table.Row>
                        <Table.Cell style={{ fontWeight: 'bold' }}>
                          처리자
                        </Table.Cell>
                        <Table.Cell>{selectedReport.resolverName}</Table.Cell>
                      </Table.Row>
                      {selectedReport.resolutionMessage && (
                        <Table.Row>
                          <Table.Cell style={{ fontWeight: 'bold' }}>
                            처리 내용
                          </Table.Cell>
                          <Table.Cell>
                            {selectedReport.resolutionMessage}
                          </Table.Cell>
                        </Table.Row>
                      )}
                      {selectedReport.resolvedAt && (
                        <Table.Row>
                          <Table.Cell style={{ fontWeight: 'bold' }}>
                            처리 일시
                          </Table.Cell>
                          <Table.Cell>
                            {new Date(selectedReport.resolvedAt).toLocaleString(
                              'ko-KR',
                            )}
                          </Table.Cell>
                        </Table.Row>
                      )}
                    </>
                  )}
                </Table.Body>
              </Table>

              {selectedReport.status === ReportStatus.PENDING && (
                <>
                  <h3 style={{ marginTop: '2rem' }}>신고 처리</h3>
                  {resolutionError && (
                    <Message negative>
                      <Message.Header>오류</Message.Header>
                      <p>{resolutionError}</p>
                    </Message>
                  )}
                  <Form>
                    <Form.Field>
                      <label>처리 결과 메시지</label>
                      <Form.TextArea
                        value={resolutionMessage}
                        onChange={(e) => setResolutionMessage(e.target.value)}
                        placeholder="처리 결과를 입력하세요"
                        rows={3}
                      />
                    </Form.Field>
                  </Form>
                </>
              )}
            </div>
          ) : (
            <div>신고 정보를 불러올 수 없습니다.</div>
          )}
        </Modal.Content>
        <Modal.Actions>
          {selectedReport?.status === ReportStatus.PENDING && (
            <Button
              positive
              onClick={handleResolveReport}
              loading={resolutionLoading}
            >
              신고 처리
            </Button>
          )}
          <Button onClick={() => setDetailModalOpen(false)}>닫기</Button>
        </Modal.Actions>
      </Modal>

      {/* 채팅 보기 모달 */}
      <Modal open={chatModalOpen} onClose={() => setChatModalOpen(false)}>
        <Modal.Header>
          채팅 내역
          {selectedReport?.targetRoomName && (
            <span
              style={{ marginLeft: '8px', fontWeight: 'normal', color: '#666' }}
            >
              ({selectedReport.targetRoomName})
            </span>
          )}
        </Modal.Header>
        <Modal.Content scrolling>
          {chatError && (
            <Message negative>
              <Message.Header>오류</Message.Header>
              <p>{chatError}</p>
            </Message>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <Button
              size="tiny"
              onClick={handleLoadOlderMessages}
              loading={chatLoading}
              disabled={!chatHasMore || chatLoading}
            >
              이전 메세지 더 보기
            </Button>
          </div>
          <Table basic="very" celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>시간</Table.HeaderCell>
                <Table.HeaderCell>보낸이</Table.HeaderCell>
                <Table.HeaderCell>메시지</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {chatMessages.map((m) => (
                <Table.Row key={m.uuid}>
                  <Table.Cell style={{ whiteSpace: 'nowrap' }}>
                    {new Date(m.createdAt).toLocaleString('ko-KR')}
                  </Table.Cell>
                  <Table.Cell>
                    {m.senderNickname || '시스템'}
                    {m.isEdited && (
                      <span
                        style={{
                          marginLeft: 6,
                          color: '#999',
                          fontSize: '0.8em',
                        }}
                      >
                        (수정됨)
                      </span>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div
                      style={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {m.message}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
              {chatMessages.length === 0 && !chatLoading && (
                <Table.Row>
                  <Table.Cell colSpan="3" textAlign="center">
                    채팅이 없습니다.
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setChatModalOpen(false)}>닫기</Button>
        </Modal.Actions>
      </Modal>
    </PaxiLayout>
  );
};

export default PaxiReportsPage;
