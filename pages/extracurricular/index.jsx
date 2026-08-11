import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import {
  Button,
  Table,
  Modal,
  Form,
  Header,
  Segment,
  Tab,
  Icon,
  Message,
} from 'semantic-ui-react';
import LayoutWithAuth from '@/components/layout/layout.auth.with';
import { PoPoAxios } from '../../utils/axios.instance';

// 쓰기 요청은 관리자/자치단체 권한이 필요하다. PoPoAxios 는 withCredentials 로
// 인증 쿠키를 함께 보내므로, 생 fetch 를 쓰면 401 이 난다.
const errorMessageOf = (err) => {
  const status = err?.response?.status;
  if (status === 401) return '로그인이 필요합니다. 다시 로그인해주세요.';
  if (status === 403) return '권한이 없습니다. 관리자 계정으로 로그인해주세요.';
  return (
    err?.response?.data?.message ?? err?.message ?? '알 수 없는 오류입니다.'
  );
};

// 카테고리는 하드코딩하지 않고 등록된 활동에서 뽑는다.
// 신규 카테고리는 드롭다운에 직접 입력해서 추가할 수 있다(allowAdditions).
const toCategoryOptions = (activities, extra) => {
  const set = new Set(activities.map((a) => a.category).filter(Boolean));
  if (extra) set.add(extra);
  return Array.from(set)
    .sort((a, b) => a.localeCompare(b, 'ko'))
    .map((c) => ({ key: c, text: c, value: c }));
};

const ACCEPTED_EXTENSIONS = ['pdf', 'docx', 'doc', 'hwpx', 'hwp'];

/** "2025_보고서.docx" -> "2025_보고서" */
const baseNameOf = (fileName) => {
  const idx = fileName.lastIndexOf('.');
  return idx === -1 ? fileName : fileName.slice(0, idx);
};

export default function AdminExtracurricularPage() {
  const [activities, setActivities] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const notify = (text) => {
    setIsError(false);
    setMessage(text);
  };
  const notifyError = (text) => {
    setIsError(true);
    setMessage(text);
  };

  // Activity Modal State
  const [isActModalOpen, setIsActModalOpen] = useState(false);
  const [actForm, setActForm] = useState({
    uuid: '',
    title: '',
    period: '',
    target: '',
    applicationMethod: '',
    description: '',
    category: '',
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
    memo: '',
    fileName: '',
  });
  // 업로드 대기 중인 실제 File 객체. 수정 시 비어 있으면 기존 파일을 유지한다.
  const [pickedFile, setPickedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  /** 파일을 고르면 제목을 확장자 뺀 파일명으로 자동 채운다. */
  const applyPickedFile = (file) => {
    if (!file) return;
    setPickedFile(file);
    setRepForm((prev) => ({
      ...prev,
      fileName: file.name,
      title: prev.title || baseNameOf(file.name),
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    applyPickedFile(e.dataTransfer.files?.[0]);
  };

  const closeRepModal = () => {
    setIsRepModalOpen(false);
    setPickedFile(null);
    setIsDragging(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [actRes, repRes] = await Promise.all([
        PoPoAxios.get('/activity'),
        PoPoAxios.get('/activity-report'),
      ]);
      setActivities(Array.isArray(actRes.data) ? actRes.data : []);
      setReports(Array.isArray(repRes.data) ? repRes.data : []);
    } catch (err) {
      notifyError(`목록을 불러오지 못했습니다. ${errorMessageOf(err)}`);
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
        category: '',
      });
    }
    setIsActModalOpen(true);
  };

  const handleSaveActivity = async () => {
    if (!actForm.title || !actForm.period) {
      alert('활동명과 모집 시기는 필수 항목입니다.');
      return;
    }

    // uuid 는 서버가 발급한다. 클라이언트에서 만들어 보내지 않는다.
    const { uuid } = actForm;
    const payload = {
      title: actForm.title,
      period: actForm.period,
      target: actForm.target,
      applicationMethod: actForm.applicationMethod,
      description: actForm.description,
      category: actForm.category,
    };

    try {
      if (uuid) {
        await PoPoAxios.patch(`/activity/${uuid}`, payload);
        notify('비교과활동 정보가 수정되었습니다.');
      } else {
        await PoPoAxios.post('/activity', payload);
        notify('신규 비교과활동이 등록되었습니다.');
      }
      setIsActModalOpen(false);
      await fetchData();
    } catch (err) {
      notifyError(`저장하지 못했습니다. ${errorMessageOf(err)}`);
    }
  };

  const handleDeleteActivity = async (uuid) => {
    if (
      !confirm(
        '정말 이 비교과활동을 삭제하시겠습니까? 연결된 보고서도 함께 삭제될 수 있습니다.',
      )
    )
      return;
    try {
      await PoPoAxios.delete(`/activity/${uuid}`);
      notify('비교과활동이 삭제되었습니다.');
      await fetchData();
    } catch (err) {
      notifyError(`삭제하지 못했습니다. ${errorMessageOf(err)}`);
    }
  };

  // Report Handlers
  const handleOpenRepModal = (rep = null) => {
    setPickedFile(null);
    if (rep) {
      setRepForm({
        uuid: rep.uuid,
        activityId: rep.activityId ?? '',
        title: rep.title ?? '',
        period: rep.period ?? '',
        grade: rep.grade ?? '',
        major: rep.major ?? '',
        author: rep.author ?? '',
        memo: rep.memo ?? '',
        fileName: rep.fileName ?? '',
      });
    } else {
      setRepForm({
        uuid: '',
        activityId: activities[0]?.uuid || '',
        title: '',
        period: '',
        grade: '',
        major: '',
        author: '',
        memo: '',
        fileName: '',
      });
    }
    setIsRepModalOpen(true);
  };

  const handleSaveReport = async () => {
    if (!repForm.title) {
      alert('보고서 제목은 필수 항목입니다.');
      return;
    }

    if (!repForm.activityId) {
      alert('활동 선택은 필수 항목입니다.');
      return;
    }

    if (!repForm.period) {
      alert('수행 시기는 필수 항목입니다.');
      return;
    }

    const { uuid } = repForm;
    if (!uuid && !pickedFile) {
      alert('원본 문서를 첨부해주세요.');
      return;
    }

    // 파일과 함께 보내야 하므로 multipart/form-data 로 전송한다.
    const payload = new FormData();
    for (const key of [
      'activityId',
      'title',
      'period',
      'grade',
      'major',
      'author',
      'memo',
    ]) {
      payload.append(key, repForm[key] ?? '');
    }
    if (pickedFile) payload.append('file', pickedFile);

    try {
      if (uuid) {
        await PoPoAxios.patch(`/activity-report/${uuid}`, payload);
        notify('보고서 수기가 수정되었습니다.');
      } else {
        await PoPoAxios.post('/activity-report', payload);
        notify('신규 보고서 수기가 등록되었습니다.');
      }
      closeRepModal();
      await fetchData();
    } catch (err) {
      notifyError(`저장하지 못했습니다. ${errorMessageOf(err)}`);
    }
  };

  const handleDeleteReport = async (uuid) => {
    if (!confirm('이 보고서 수기를 삭제하시겠습니까?')) return;
    try {
      await PoPoAxios.delete(`/activity-report/${uuid}`);
      notify('보고서 수기가 삭제되었습니다.');
      await fetchData();
    } catch (err) {
      notifyError(`삭제하지 못했습니다. ${errorMessageOf(err)}`);
    }
  };

  const panes = [
    {
      menuItem: '비교과활동 카테고리 관리',
      render: () => (
        <Tab.Pane>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Header as="h3">등록된 비교과활동 ({activities.length}개)</Header>
            <Button
              color="blue"
              icon
              labelPosition="left"
              onClick={() => handleOpenActModal()}
            >
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
                  <Table.Cell style={{ fontWeight: 'bold' }}>
                    {act.title}
                  </Table.Cell>
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
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <Header as="h3">등록된 보고서 및 수기 ({reports.length}개)</Header>
            <Button
              color="green"
              icon
              labelPosition="left"
              onClick={() => handleOpenRepModal()}
            >
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
                <Table.HeaderCell style={{ width: 60 }}>
                  작성자
                </Table.HeaderCell>
                <Table.HeaderCell>파일명</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 100 }}>관리</Table.HeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {reports.map((rep) => {
                const linkedAct = activities.find(
                  (a) => a.uuid === rep.activityId,
                );
                return (
                  <Table.Row key={rep.uuid}>
                    <Table.Cell>
                      {linkedAct ? linkedAct.title : '미지정'}
                    </Table.Cell>
                    <Table.Cell style={{ fontWeight: 'bold' }}>
                      {rep.title}
                    </Table.Cell>
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
    <LayoutWithAuth>
      <Container>
        <Segment basic>
          <Header as="h2">
            <Icon name="book" />
            <Header.Content>
              비교과활동 백과사전 관리
              <Header.Subheader>
                학지팀 및 총학생회 제공 비교과 프로그램 카테고리 및 학생 수기
                보고서를 관리합니다.
              </Header.Subheader>
            </Header.Content>
          </Header>

          {message && (
            <Message
              onDismiss={() => setMessage(null)}
              header={isError ? '오류' : '안내'}
              content={message}
              positive={!isError}
              negative={isError}
            />
          )}

          <Segment basic loading={loading} style={{ padding: 0 }}>
            <Tab panes={panes} />
          </Segment>

          {/* Activity Modal */}
          <Modal
            open={isActModalOpen}
            onClose={() => setIsActModalOpen(false)}
            size="small"
          >
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
                    onChange={(e) =>
                      setActForm({ ...actForm, title: e.target.value })
                    }
                  />
                  <Form.Select
                    label="카테고리"
                    options={toCategoryOptions(activities, actForm.category)}
                    value={actForm.category}
                    search
                    allowAdditions
                    additionLabel="새 카테고리 추가: "
                    onAddItem={(e, { value }) =>
                      setActForm({ ...actForm, category: value })
                    }
                    onChange={(e, { value }) =>
                      setActForm({ ...actForm, category: value })
                    }
                    placeholder="카테고리 선택 또는 새로 입력"
                  />
                </Form.Group>

                <Form.Group widths="equal">
                  <Form.Input
                    label="모집 / 시행 시기"
                    placeholder="예: 매년 하계/동계 방학 중"
                    value={actForm.period}
                    onChange={(e) =>
                      setActForm({ ...actForm, period: e.target.value })
                    }
                  />
                  <Form.Input
                    label="지원 대상"
                    placeholder="예: 학부 재학생 (평점 3.0 이상)"
                    value={actForm.target}
                    onChange={(e) =>
                      setActForm({ ...actForm, target: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.TextArea
                  label="신청 및 선발 절차"
                  placeholder="지원서 제출 -> 서류 평가 -> 면접 전형..."
                  value={actForm.applicationMethod}
                  onChange={(e) =>
                    setActForm({
                      ...actForm,
                      applicationMethod: e.target.value,
                    })
                  }
                />

                <Form.TextArea
                  label="활동 상세 설명"
                  placeholder="프로그램 개요 및 특징 작성..."
                  value={actForm.description}
                  onChange={(e) =>
                    setActForm({ ...actForm, description: e.target.value })
                  }
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
          <Modal open={isRepModalOpen} onClose={closeRepModal} size="large">
            <Modal.Header>
              {repForm.uuid ? '보고서 수기 수정' : '신규 보고서 수기 등록'}
            </Modal.Header>
            <Modal.Content scrolling>
              <Form>
                <Form.Group widths="equal">
                  <Form.Select
                    label="연관 비교과활동"
                    options={activities.map((a) => ({
                      key: a.uuid,
                      text: a.title,
                      value: a.uuid,
                    }))}
                    value={repForm.activityId}
                    onChange={(e, { value }) =>
                      setRepForm({ ...repForm, activityId: value })
                    }
                  />
                  <Form.Input
                    label="수기/보고서 제목*"
                    placeholder="예: 2025 유럽 탄소중립 교통 탐방 보고서"
                    value={repForm.title}
                    onChange={(e) =>
                      setRepForm({ ...repForm, title: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Group widths="equal">
                  <Form.Input
                    label="수행 시기"
                    placeholder="예: 2025학년도 하계"
                    value={repForm.period}
                    onChange={(e) =>
                      setRepForm({ ...repForm, period: e.target.value })
                    }
                  />
                  <Form.Input
                    label="전공 (선택)"
                    placeholder="예: 컴퓨터공학과"
                    value={repForm.major}
                    onChange={(e) =>
                      setRepForm({ ...repForm, major: e.target.value })
                    }
                  />
                  <Form.Input
                    label="학년 (선택)"
                    placeholder="예: 3학년"
                    value={repForm.grade}
                    onChange={(e) =>
                      setRepForm({ ...repForm, grade: e.target.value })
                    }
                  />
                  <Form.Input
                    label="작성자 (선택)"
                    placeholder="예: 김*훈"
                    value={repForm.author}
                    onChange={(e) =>
                      setRepForm({ ...repForm, author: e.target.value })
                    }
                  />
                </Form.Group>

                <Form.Field>
                  <label>원본 문서</label>
                  <DropZone
                    dragging={isDragging}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon name="cloud upload" size="big" />
                    {pickedFile ? (
                      <>
                        <strong>{pickedFile.name}</strong>
                        <small>
                          {(pickedFile.size / 1024 / 1024).toFixed(2)} MB · 다시
                          끌어다 놓으면 교체됩니다
                        </small>
                      </>
                    ) : repForm.fileName ? (
                      <>
                        <strong>{repForm.fileName}</strong>
                        <small>
                          이미 등록된 파일입니다. 교체하려면 새 파일을 올리세요
                        </small>
                      </>
                    ) : (
                      <>
                        <strong>여기로 파일을 끌어다 놓으세요</strong>
                        <small>또는 클릭해서 찾아보기 (PDF, DOCX, HWPX)</small>
                      </>
                    )}
                  </DropZone>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
                    hidden
                    onChange={(e) => applyPickedFile(e.target.files?.[0])}
                  />
                </Form.Field>

                <Form.TextArea
                  label="메모"
                  placeholder="관리자 메모 (선택)"
                  value={repForm.memo}
                  onChange={(e) =>
                    setRepForm({ ...repForm, memo: e.target.value })
                  }
                />
              </Form>
            </Modal.Content>
            <Modal.Actions>
              <Button onClick={closeRepModal}>취소</Button>
              <Button positive onClick={handleSaveReport}>
                저장
              </Button>
            </Modal.Actions>
          </Modal>
        </Segment>
      </Container>
    </LayoutWithAuth>
  );
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const DropZone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 28px 16px;
  border: 2px dashed ${(props) => (props.dragging ? '#2185d0' : '#c8cbcf')};
  border-radius: 8px;
  background-color: ${(props) => (props.dragging ? '#f0f7ff' : '#fafafa')};
  color: #5b6169;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;

  &:hover {
    border-color: #2185d0;
  }

  strong {
    color: #1b1c1d;
    word-break: break-all;
  }

  small {
    color: #767b82;
  }
`;
