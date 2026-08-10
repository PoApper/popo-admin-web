import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  TextArea,
  Select,
  Header,
  Segment,
  Tab,
  Icon,
  Message,
} from 'semantic-ui-react';
import Navbar from '../../components/navbar/navbar';

const categoryOptions = [
  { key: 'global', text: '글로벌/해외', value: '글로벌/해외' },
  { key: 'academic', text: '학술/연구', value: '학술/연구' },
  { key: 'volunteer', text: '봉사/사회공헌', value: '봉사/사회공헌' },
  { key: 'startup', text: '창업/취업', value: '창업/취업' },
];

const fileTypeOptions = [
  { key: 'pdf', text: 'PDF', value: 'pdf' },
  { key: 'docx', text: 'DOCX', value: 'docx' },
  { key: 'hwpx', text: 'HWPX', value: 'hwpx' },
];

const INITIAL_ACTIVITIES = [
  {
    uuid: 'act-01',
    title: '세계문화탐방대',
    period: '매년 하계/동계 방학 중 (연 2회)',
    target: '학부 재학생 (직전 학기 평점 3.0 이상)',
    applicationMethod: '지원서 및 탐방 계획서 작성 후 포털 접수 -> 서류 심사 -> 면접 전형',
    description: '학생들이 직접 탐방 주제와 국가를 선정하고 문화, 사회, 학문 분야의 연구 과제를 직접 체험하고 분석하는 글로벌 도전 프로그램입니다.',
    category: '글로벌/해외',
  },
  {
    uuid: 'act-02',
    title: '노벨 위크 탐방단',
    period: '매년 10월 ~ 11월 중 모집',
    target: '이공계열 및 인문사회계열 학부 2~4학년',
    applicationMethod: '노벨상 관련 에세이 제출 -> 심사 -> 학과장 추천 및 면접',
    description: '스웨덴 스톡홀름에서 열리는 노벨상 시상식 주간에 현지를 방문하여 노벨 재단 강연 참석, 스웨덴 명문대 학생들과의 학술 교류 등을 진행하는 최고 권위의 학술 탐방 프로그램입니다.',
    category: '학술/연구',
  },
];

const INITIAL_REPORTS = [
  {
    uuid: 'rep-01',
    activityId: 'act-01',
    title: '유럽 친환경 도시 설계 및 탄소중립 교통 시스템 탐방 보고서',
    period: '2025학년도 하계',
    grade: '3학년',
    major: '도시공학과',
    author: '민*우',
    wordsToJuniors: '현지 전문가 인터뷰나 기관 방문 메일을 최소 한 달 전부터 꼼꼼히 보내두는 게 좋습니다.',
    aiSummary: '독일 프라이부르크와 네덜란드 암스테르담의 친환경 대중교통 인프라 탐방 결과 보고서.',
    fileName: '2025_하계_세계문화탐방대_유럽교통보고서.pdf',
    fileType: 'pdf',
  },
];

export default function AdminExtracurricularPage() {
  const [activities, setActivities] = useState(INITIAL_ACTIVITIES);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Activity Modal State
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [actForm, setActForm] = useState({
    uuid: '',
    title: '',
    period: '',
    target: '',
    applicationMethod: '',
    description: '',
    category: '글로벌/해외',
  });

  // Report Modal State
  const [isRepModalOpen, setIsRepModalOpen] = useState(false);
  const [repForm, setRepForm] = useState({
    uuid: '',
    activityId: '',
    title: '',
    period: '',
    grade: '3학년',
    major: '',
    author: '',
    wordsToJuniors: '',
    aiSummary: '',
    fileName: '',
    fileType: 'pdf',
  });

  const apiUrl = process.env.NEXT_PUBLIC_API || 'https://api.popo-dev.poapper.club';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const actRes = await fetch(`${apiUrl}/activity`);
      if (actRes.ok) {
        const actData = await actRes.json();
        if (Array.isArray(actData) && actData.length > 0) {
          setActivities(actData);
        }
      }

      const repRes = await fetch(`${apiUrl}/activity-report`);
      if (repRes.ok) {
        const repData = await repRes.json();
        if (Array.isArray(repData) && repData.length > 0) {
          setReports(repData);
        }
      }
    } catch (err) {
      console.log('Failed fetching admin data from API, using state fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Activity Handlers
  const handleOpenActModal = (act = null) => {
    if (act) {
      setActForm(act);
    } else {
      setActForm({
        uuid: '',
        title: '',
        period: '',
        target: '',
        applicationMethod: '',
        description: '',
        category: '글로벌/해외',
      });
    }
    setIsActModalOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!actForm.title || !actForm.period) {
      alert('활동명과 모집 시기는 필수 항목입니다.');
      return;
    }

    try {
      if (actForm.uuid) {
        // Update
        const res = await fetch(`${apiUrl}/activity/${actForm.uuid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actForm),
        });
        if (res.ok) {
          setMessage('비교과활동 정보가 수정되었습니다.');
        }
        setActivities((prev) =>
          prev.map((a) => (a.uuid === actForm.uuid ? { ...a, ...actForm } : a))
        );
      } else {
        // Create
        const newUuid = `act-${Date.now()}`;
        const newAct = { ...actForm, uuid: newUuid };
        const res = await fetch(`${apiUrl}/activity`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newAct),
        });
        if (res.ok) {
          const created = await res.json();
          setActivities((prev) => [created, ...prev]);
        } else {
          setActivities((prev) => [newAct, ...prev]);
        }
        setMessage('신규 비교과활동이 등록되었습니다.');
      }
    } catch (err) {
      console.log('API call fallback during save:', err);
      const newUuid = actForm.uuid || `act-${Date.now()}`;
      setActivities((prev) => {
        const exists = prev.some((a) => a.uuid === newUuid);
        if (exists) {
          return prev.map((a) => (a.uuid === newUuid ? { ...a, ...actForm } : a));
        }
        return [{ ...actForm, uuid: newUuid }, ...prev];
      });
      setMessage('저장되었습니다 (로컬 상태 반영).');
    } finally {
      setIsActModalOpen(false);
    }
  };

  const handleDeleteActivity = async (uuid) => {
    if (!confirm('정말 이 비교과활동을 삭제하시겠습니까? 연결된 보고서도 함께 삭제될 수 있습니다.'))
      return;
    try {
      await fetch(`${apiUrl}/activity/${uuid}`, { method: 'DELETE' });
    } catch (e) {
      console.log('API delete fallback:', e);
    }
    setActivities((prev) => prev.filter((a) => a.uuid !== uuid));
    setMessage('비교과활동이 삭제되었습니다.');
  };

  // Report Handlers
  const handleOpenRepModal = (rep = null) => {
    if (rep) {
      setRepForm(rep);
    } else {
      setRepForm({
        uuid: '',
        activityId: activities[0]?.uuid || '',
        title: '',
        period: '2025학년도 하계',
        grade: '3학년',
        major: '',
        author: '',
        wordsToJuniors: '',
        aiSummary: '',
        fileName: '',
        fileType: 'pdf',
      });
    }
    setIsRepModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (!repForm.title || !repForm.activityId) {
      alert('보고서 제목과 활동 선택은 필수 항목입니다.');
      return;
    }

    try {
      if (repForm.uuid) {
        // Update
        await fetch(`${apiUrl}/activity-report/${repForm.uuid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(repForm),
        });
        setReports((prev) =>
          prev.map((r) => (r.uuid === repForm.uuid ? { ...r, ...repForm } : r))
        );
        setMessage('보고서 수기가 수정되었습니다.');
      } else {
        // Create
        const newUuid = `rep-${Date.now()}`;
        const newRep = { ...repForm, uuid: newUuid };
        const res = await fetch(`${apiUrl}/activity-report`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRep),
        });
        if (res.ok) {
          const created = await res.json();
          setReports((prev) => [created, ...prev]);
        } else {
          setReports((prev) => [newRep, ...prev]);
        }
        setMessage('신규 보고서 수기가 등록되었습니다.');
      }
    } catch (err) {
      console.log('API report save fallback:', err);
      const newUuid = repForm.uuid || `rep-${Date.now()}`;
      setReports((prev) => {
        const exists = prev.some((r) => r.uuid === newUuid);
        if (exists) {
          return prev.map((r) => (r.uuid === newUuid ? { ...r, ...repForm } : r));
        }
        return [{ ...repForm, uuid: newUuid }, ...prev];
      });
      setMessage('저장되었습니다 (로컬 상태 반영).');
    } finally {
      setIsRepModalOpen(false);
    }
  };

  const handleDeleteReport = async (uuid) => {
    if (!confirm('이 보고서 수기를 삭제하시겠습니까?')) return;
    try {
      await fetch(`${apiUrl}/activity-report/${uuid}`, { method: 'DELETE' });
    } catch (e) {
      console.log('API delete report fallback:', e);
    }
    setReports((prev) => prev.filter((r) => r.uuid !== uuid));
    setMessage('보고서 수기가 삭제되었습니다.');
  };

  const panes = [
    {
      menuItem: '비교과활동 카테고리 관리',
      render: () => (
        <Tab.Pane>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Header as="h3">등록된 비교과활동 ({activities.length}개)</Header>
            <Button color="blue" icon labelPosition="left" onClick={() => handleOpenActModal()}>
              <Icon name="add" />
              신규 비교과활동 추가
            </Button>
          </div>

          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>카테고리</Table.HeaderCell>
                <Table.HeaderCell>활동명</Table.HeaderCell>
                <Table.HeaderCell>모집/시행 시기</Table.HeaderCell>
                <Table.HeaderCell>지원 대상</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 120 }}>관리</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {activities.map((act) => (
                <Table.Row key={act.uuid}>
                  <Table.Cell>{act.category}</Table.Cell>
                  <Table.Cell style={{ fontWeight: 'bold' }}>{act.title}</Table.Cell>
                  <Table.Cell>{act.period}</Table.Cell>
                  <Table.Cell>{act.target}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="tiny"
                      icon="edit"
                      onClick={() => handleOpenActModal(act)}
                    />
                    <Button
                      size="tiny"
                      color="red"
                      icon="trash"
                      onClick={() => handleDeleteActivity(act.uuid)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Tab.Pane>
      ),
    },
    {
      menuItem: '활동 보고서 / 수기 관리',
      render: () => (
        <Tab.Pane>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Header as="h3">등록된 보고서 및 수기 ({reports.length}개)</Header>
            <Button color="green" icon labelPosition="left" onClick={() => handleOpenRepModal()}>
              <Icon name="upload" />
              신규 보고서 수기 업로드
            </Button>
          </div>

          <Table celled striped>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>연관 활동</Table.HeaderCell>
                <Table.HeaderCell>보고서 제목</Table.HeaderCell>
                <Table.HeaderCell>수행 시기</Table.HeaderCell>
                <Table.HeaderCell>전공 / 학년</Table.HeaderCell>
                <Table.HeaderCell>작성자</Table.HeaderCell>
                <Table.HeaderCell>파일명</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 120 }}>관리</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {reports.map((rep) => {
                const linkedAct = activities.find((a) => a.uuid === rep.activityId);
                return (
                  <Table.Row key={rep.uuid}>
                    <Table.Cell>{linkedAct ? linkedAct.title : '미지정'}</Table.Cell>
                    <Table.Cell style={{ fontWeight: 'bold' }}>{rep.title}</Table.Cell>
                    <Table.Cell>{rep.period}</Table.Cell>
                    <Table.Cell>
                      {rep.major} ({rep.grade})
                    </Table.Cell>
                    <Table.Cell>{rep.author}</Table.Cell>
                    <Table.Cell>{rep.fileName}</Table.Cell>
                    <Table.Cell>
                      <Button
                        size="tiny"
                        icon="edit"
                        onClick={() => handleOpenRepModal(rep)}
                      />
                      <Button
                        size="tiny"
                        color="red"
                        icon="trash"
                        onClick={() => handleDeleteReport(rep.uuid)}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Tab.Pane>
      ),
    },
  ];

  return (
    <>
      <Navbar />
      <Container>
        <Segment basic style={{ marginTop: 80 }}>
          <Header as="h2">
            <Icon name="book" />
            <Header.Content>
              비교과활동 백과사전 관리
              <Header.Subheader>
                학지팀 및 총학생회 제공 비교과 프로그램 카테고리 및 학생 수기 보고서를 관리합니다.
              </Header.Subheader>
            </Header.Content>
          </Header>

          {message && (
            <Message
              onDismiss={() => setMessage(null)}
              header="안내"
              content={message}
              positive
            />
          )}

          <Tab panes={panes} />

          {/* Activity Modal */}
          <Modal open={isActModalOpen} onClose={() => setIsActModalOpen(false)} size="small">
            <Modal.Header>
              {actForm.uuid ? '비교과활동 정보 수정' : '신규 비교과활동 추가'}
            </Modal.Header>
            <Modal.Content>
              <Form>
                <Form.Group widths="equal">
                  <Form.Input
                    label="활동명"
                    placeholder="예: 세계문화탐방대"
                    value={actForm.title}
                    onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  />
                  <Form.Select
                    label="카테고리"
                    options={categoryOptions}
                    value={actForm.category}
                    onChange={(e, { value }) => setActForm({ ...actForm, category: value })}
                  />
                </Form.Group>

                <Form.Group widths="equal">
                  <Form.Input
                    label="모집 / 시행 시기"
                    placeholder="예: 매년 하계/동계 방학 중"
                    value={actForm.period}
                    onChange={(e) => setActForm({ ...actForm, period: e.target.value })}
                  />
                  <Form.Input
                    label="지원 대상"
                    placeholder="예: 학부 재학생 (평점 3.0 이상)"
                    value={actForm.target}
                    onChange={(e) => setActForm({ ...actForm, target: e.target.value })}
                  />
                </Form.Group>

                <Form.TextArea
                  label="신청 및 선발 절차"
                  placeholder="지원서 제출 -> 서류 평가 -> 면접 전형..."
                  value={actForm.applicationMethod}
                  onChange={(e) => setActForm({ ...actForm, applicationMethod: e.target.value })}
                />

                <Form.TextArea
                  label="활동 상세 설명"
                  placeholder="프로그램 개요 및 특징 작성..."
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setIsActModalOpen(false)}>취소</Button>
              <Button primary onClick={handleSaveActivity}>
                저장
              </Button>
            </Modal.Actions>
          </Modal>

          {/* Report Modal */}
          <Modal open={isRepModalOpen} onClose={() => setIsRepModalOpen(false)} size="large">
            <Modal.Header>
              {repForm.uuid ? '보고서 수기 수정' : '신규 보고서 수기 등록'}
            </Modal.Header>
            <Modal.Content scrolling>
              <Form>
                <Form.Group widths="equal">
                  <Form.Select
                    label="연관 비교과활동"
                    options={activities.map((a) => ({ key: a.uuid, text: a.title, value: a.uuid }))}
                    value={repForm.activityId}
                    onChange={(e, { value }) => setRepForm({ ...repForm, activityId: value })}
                  />
                  <Form.Input
                    label="수기/보고서 제목"
                    placeholder="예: 2025 유럽 탄소중립 교통 탐방 보고서"
                    value={repForm.title}
                    onChange={(e) => setRepForm({ ...repForm, title: e.target.value })}
                  />
                </Form.Group>

                <Form.Group widths="equal">
                  <Form.Input
                    label="수행 시기"
                    placeholder="예: 2025학년도 하계"
                    value={repForm.period}
                    onChange={(e) => setRepForm({ ...repForm, period: e.target.value })}
                  />
                  <Form.Input
                    label="전공"
                    placeholder="예: 컴퓨터공학과"
                    value={repForm.major}
                    onChange={(e) => setRepForm({ ...repForm, major: e.target.value })}
                  />
                  <Form.Input
                    label="학년"
                    placeholder="예: 3학년"
                    value={repForm.grade}
                    onChange={(e) => setRepForm({ ...repForm, grade: e.target.value })}
                  />
                  <Form.Input
                    label="작성자 (익명)"
                    placeholder="예: 김*훈"
                    value={repForm.author}
                    onChange={(e) => setRepForm({ ...repForm, author: e.target.value })}
                  />
                </Form.Group>

                <Form.Group widths="equal">
                  <Form.Input
                    label="첨부 파일명"
                    placeholder="예: 2025_세계문화탐방대_보고서.pdf"
                    value={repForm.fileName}
                    onChange={(e) => setRepForm({ ...repForm, fileName: e.target.value })}
                  />
                  <Form.Select
                    label="파일 확장자"
                    options={fileTypeOptions}
                    value={repForm.fileType}
                    onChange={(e, { value }) => setRepForm({ ...repForm, fileType: value })}
                  />
                </Form.Group>

                <Form.TextArea
                  label="후배에게 한마디 (지원 및 준비 노하우)"
                  placeholder="후배들을 위한 실질적인 서류/면접 준비 조언..."
                  value={repForm.wordsToJuniors}
                  onChange={(e) => setRepForm({ ...repForm, wordsToJuniors: e.target.value })}
                />

                <Form.TextArea
                  label="AI 보고서 요약"
                  placeholder="보고서의 핵심 요약 내용..."
                  value={repForm.aiSummary}
                  onChange={(e) => setRepForm({ ...repForm, aiSummary: e.target.value })}
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={() => setIsRepModalOpen(false)}>취소</Button>
              <Button positive onClick={handleSaveReport}>
                저장
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment>
      </Container>
    </>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;
