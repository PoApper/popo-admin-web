import { useEffect, useState } from 'react';
import {
  Table,
  Message,
  Dropdown,
  Button,
  Modal,
  Form,
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

  // 신고 상태에 따른 텍스트 반환
  const getStatusText = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return '대기 중';
      case ReportStatus.IN_PROGRESS:
        return '처리 중';
      case ReportStatus.COMPLETED:
        return '완료';
      case ReportStatus.REJECTED:
        return '거절';
      default:
        return '알 수 없음';
    }
  };

  // 신고 상태에 따른 색상 반환
  const getStatusColor = (status) => {
    switch (status) {
      case ReportStatus.PENDING:
        return 'orange';
      case ReportStatus.IN_PROGRESS:
        return 'blue';
      case ReportStatus.COMPLETED:
        return 'green';
      case ReportStatus.REJECTED:
        return 'red';
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
      <h3>신고 처리</h3>

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
    </PaxiLayout>
  );
};

export default PaxiReportsPage;
