import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  Button,
  Divider,
  Form,
  Header,
  Icon,
  Message,
  Modal,
  Segment,
  Table,
} from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import { RegionOptions } from '@/assets/region.options';
import { hourDiff, roundUpByDuration } from '@/utils/time-date';

const createId = () =>
  `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

function calculateDurationMinutes(startTime, endTime) {
  const startMoment = moment(startTime, 'HHmm');
  const endMoment = moment(endTime, 'HHmm');
  return endMoment.diff(startMoment, 'minutes');
}

const PlaceReservationBulkCreatePage = ({ placeList }) => {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState(null);
  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 일괄 처리 결과 모달 상태
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [taskItems, setTaskItems] = useState([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // 1. 장소 목록 행 상태 (기본 1개 행)
  const defaultRegion = RegionOptions[0]?.value || 'STUDENT_HALL';
  const [placeRows, setPlaceRows] = useState([
    {
      id: createId(),
      region: defaultRegion,
      placeInfo: null,
    },
  ]);

  // 2. 예약 일시 목록 행 상태 (기본 1개 행)
  const now = roundUpByDuration(moment(), 30);
  const nowNext30Min = moment(now).add(30, 'minute');

  const [timeRows, setTimeRows] = useState([
    {
      id: createId(),
      date: now,
      startTime: now,
      endTime: nowNext30Min,
    },
  ]);

  useEffect(() => {
    PoPoAxios.get('/auth/verifyToken')
      .then((res) => setUserInfo(res.data))
      .catch(() => {
        alert('로그인 후 예약할 수 있습니다.');
        router.push('/auth/login');
      });
  }, [router]);

  // 장소 행 추가 (윗행 복사)
  const handleAddPlaceRow = () => {
    const lastRow = placeRows[placeRows.length - 1];
    setPlaceRows((prev) => [
      ...prev,
      {
        id: createId(),
        region: lastRow ? lastRow.region : defaultRegion,
        placeInfo: lastRow ? lastRow.placeInfo : null,
      },
    ]);
  };

  // 장소 행 삭제
  const handleRemovePlaceRow = (id) => {
    if (placeRows.length <= 1) {
      alert('최소 1개의 장소 행이 필요합니다.');
      return;
    }
    setPlaceRows((prev) => prev.filter((row) => row.id !== id));
  };

  // 장소 행 변경
  const handleUpdatePlaceRegion = (id, regionValue) => {
    setPlaceRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, region: regionValue, placeInfo: null } : row,
      ),
    );
  };

  const handleUpdatePlaceInfo = (id, placeValue) => {
    setPlaceRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, placeInfo: placeValue } : row,
      ),
    );
  };

  // 일시 행 추가 (윗행 복사)
  const handleAddTimeRow = () => {
    const lastRow = timeRows[timeRows.length - 1];
    setTimeRows((prev) => [
      ...prev,
      {
        id: createId(),
        date: lastRow ? moment(lastRow.date) : now,
        startTime: lastRow ? moment(lastRow.startTime) : now,
        endTime: lastRow ? moment(lastRow.endTime) : nowNext30Min,
      },
    ]);
  };

  // 일시 행 삭제
  const handleRemoveTimeRow = (id) => {
    if (timeRows.length <= 1) {
      alert('최소 1개의 일시 행이 필요합니다.');
      return;
    }
    setTimeRows((prev) => prev.filter((row) => row.id !== id));
  };

  // 일시 행 변경
  const handleUpdateTimeRow = (id, field, value) => {
    setTimeRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)),
    );
  };

  const validPlaceRows = placeRows.filter((r) => r.placeInfo !== null);
  const totalCombinations = validPlaceRows.length * timeRows.length;

  // 클라이언트 사전 유효성 검사
  const validateFormBeforeSubmit = () => {
    if (!phone.trim()) {
      alert('전화번호를 입력해 주세요.');
      return false;
    }
    if (!title.trim() || title.length === 1) {
      alert('올바른 예약 제목을 입력해 주세요.');
      return false;
    }
    if (!description.trim() || description.length === 1) {
      alert('올바른 예약 설명을 입력해 주세요.');
      return false;
    }
    if (validPlaceRows.length === 0) {
      alert('최소 1개 이상의 장소를 선택해 주세요.');
      return false;
    }
    if (timeRows.length === 0) {
      alert('최소 1개 이상의 일시를 설정해 주세요.');
      return false;
    }

    // 1. 장소 중복 체크
    const placeUuids = validPlaceRows.map((r) => r.placeInfo.uuid);
    const uniquePlaceUuids = new Set(placeUuids);
    if (uniquePlaceUuids.size < placeUuids.length) {
      alert(
        '장소 목록에 중복으로 선택된 장소가 있습니다. 중복 항목을 제거해 주세요.',
      );
      return false;
    }

    // 2. 제출 일시 목록 내 동일 날짜 시간 겹침 체크
    for (let i = 0; i < timeRows.length; i++) {
      for (let j = i + 1; j < timeRows.length; j++) {
        const row1 = timeRows[i];
        const row2 = timeRows[j];
        if (row1.date.format('YYYY-MM-DD') === row2.date.format('YYYY-MM-DD')) {
          const s1 = parseInt(row1.startTime.format('HHmm'), 10);
          const e1 = parseInt(row1.endTime.format('HHmm'), 10);
          const s2 = parseInt(row2.startTime.format('HHmm'), 10);
          const e2 = parseInt(row2.endTime.format('HHmm'), 10);

          if (s1 < e2 && s2 < e1) {
            alert(
              `일시 목록 [${i + 1}번 행]과 [${j + 1}번 행]의 시간이 서로 겹칩니다 (${row1.date.format('YYYY-MM-DD')}).`,
            );
            return false;
          }
        }
      }
    }

    // 3. 장소별 하루 최대 예약 가능 시간(maxMinutes) 초과 체크
    for (const pRow of validPlaceRows) {
      const place = pRow.placeInfo;
      if (!place.maxMinutes) continue;

      const dateMap = {};
      for (const tRow of timeRows) {
        const dStr = tRow.date.format('YYYY-MM-DD');
        const duration = calculateDurationMinutes(
          tRow.startTime.format('HHmm'),
          tRow.endTime.format('HHmm'),
        );
        dateMap[dStr] = (dateMap[dStr] || 0) + duration;
      }

      for (const [dStr, sumMins] of Object.entries(dateMap)) {
        if (sumMins > place.maxMinutes) {
          alert(
            `장소 "${place.name}"의 하루 최대 예약 가능 시간(${place.maxMinutes}분)을 초과했습니다. (${dStr} 선택된 총 시간: ${sumMins}분)`,
          );
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateFormBeforeSubmit()) return;

    const confirmMsg = `총 ${totalCombinations}건 (장소 ${validPlaceRows.length}개 × 일시 ${timeRows.length}개)의 일괄 예약을 생성하시겠습니까?`;
    if (!confirm(confirmMsg)) return;

    const initialTasks = [];
    for (const pRow of validPlaceRows) {
      for (const tRow of timeRows) {
        initialTasks.push({
          id: `${pRow.placeInfo.uuid}_${tRow.date.format('YYYYMMDD')}_${tRow.startTime.format('HHmm')}_${tRow.endTime.format('HHmm')}`,
          placeName: pRow.placeInfo.name,
          placeId: pRow.placeInfo.uuid,
          dateStr: tRow.date.format('YYYY-MM-DD'),
          dateFormatted: tRow.date.format('YYYYMMDD'),
          startTimeStr: tRow.startTime.format('HH:mm'),
          endTimeStr: tRow.endTime.format('HH:mm'),
          startTimeFormatted: tRow.startTime.format('HHmm'),
          endTimeFormatted: tRow.endTime.format('HHmm'),
          status: 'pending',
          errorMsg: '',
        });
      }
    }

    setTaskItems(initialTasks);
    setIsResultModalOpen(true);
    setIsProcessingBatch(true);
    setIsSubmitting(true);

    for (let i = 0; i < initialTasks.length; i++) {
      const task = initialTasks[i];

      setTaskItems((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, status: 'uploading' } : t)),
      );

      try {
        await PoPoAxios.post('/reservation-place', {
          placeId: task.placeId,
          phone: phone,
          title: title,
          description: description,
          date: task.dateFormatted,
          startTime: task.startTimeFormatted,
          endTime: task.endTimeFormatted,
        });
        setTaskItems((prev) =>
          prev.map((t, idx) => (idx === i ? { ...t, status: 'success' } : t)),
        );
      } catch (error) {
        const msg =
          error?.response?.data?.message || error?.message || '예약 생성 실패';
        setTaskItems((prev) =>
          prev.map((t, idx) =>
            idx === i ? { ...t, status: 'error', errorMsg: msg } : t,
          ),
        );
      }
    }

    setIsProcessingBatch(false);
    setIsSubmitting(false);
  };

  return (
    <ReservationLayout>
      <h1>일괄 장소 예약 생성 (관리자)</h1>

      <Message info>
        <Message.Header>일괄 예약 생성 안내</Message.Header>
        <p>
          여러 개의 장소 행과 여러 개의 날짜/시간 행을 등록하면, (장소 목록) ×
          (일시 목록) 조합으로 예약을 일괄 생성합니다.
          <br />행 추가 버튼 클릭 시 <b>직전 행의 설정 정보가 자동으로 복사</b>
          됩니다.
        </p>
      </Message>

      <Form loading={isSubmitting}>
        {/* 공통 기본 정보 */}
        <Segment>
          <Header as="h4">공통 예약 정보</Header>
          <Form.Group widths="equal">
            <Form.Input
              required
              readOnly
              label={'사용자'}
              value={userInfo ? userInfo.name : ''}
            />
            <Form.Input
              required
              label={'전화번호'}
              placeholder={'010-xxxx-xxxx'}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Form.Group>
          <Form.Input
            required
            label={'예약 제목'}
            placeholder={'예약 제목을 입력해 주세요.'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Form.TextArea
            required
            label={'설명'}
            placeholder={'사용 인원 및 목적 등을 작성해 주세요.'}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Segment>

        {/* 장소 목록 */}
        <Segment style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Header as="h4" style={{ margin: 0 }}>
              1. 장소 목록 ({placeRows.length}개 행)
            </Header>
            <Button
              type="button"
              primary
              size="small"
              icon
              labelPosition="left"
              onClick={handleAddPlaceRow}
            >
              <Icon name="plus" />
              추가
            </Button>
          </div>

          <Table celled striped compact style={{ margin: 0 }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell style={{ width: 40 }}>#</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 220 }}>지역</Table.HeaderCell>
                <Table.HeaderCell>장소</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 60 }}>삭제</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {placeRows.map((row, idx) => {
                const filteredPlaces = placeList.filter(
                  (p) => p.region === row.region,
                );
                const placeOptions = filteredPlaces.map((p) => ({
                  key: p.id,
                  value: p,
                  text: p.name,
                }));

                return (
                  <Table.Row key={row.id}>
                    <Table.Cell>{idx + 1}</Table.Cell>
                    <Table.Cell>
                      <Form.Select
                        required
                        options={RegionOptions}
                        value={row.region}
                        onChange={(e, { value }) =>
                          handleUpdatePlaceRegion(row.id, value)
                        }
                        placeholder="지역 선택"
                      />
                    </Table.Cell>
                    <Table.Cell>
                      <Form.Select
                        required
                        options={placeOptions}
                        value={row.placeInfo}
                        onChange={(e, { value }) =>
                          handleUpdatePlaceInfo(row.id, value)
                        }
                        placeholder="장소 선택"
                      />
                    </Table.Cell>
                    <Table.Cell textAlign="center">
                      <Button
                        type="button"
                        icon="trash"
                        color="red"
                        size="tiny"
                        disabled={placeRows.length <= 1}
                        onClick={() => handleRemovePlaceRow(row.id)}
                      />
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Segment>

        {/* 예약 일시 목록 */}
        <Segment style={{ marginTop: 20 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Header as="h4" style={{ margin: 0 }}>
              2. 예약 일시 목록 ({timeRows.length}개 행)
            </Header>
            <Button
              type="button"
              primary
              size="small"
              icon
              labelPosition="left"
              onClick={handleAddTimeRow}
            >
              <Icon name="plus" />
              추가
            </Button>
          </div>

          <Table celled striped compact style={{ margin: 0 }}>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell style={{ width: 40 }}>#</Table.HeaderCell>
                <Table.HeaderCell>날짜</Table.HeaderCell>
                <Table.HeaderCell>시작 시간</Table.HeaderCell>
                <Table.HeaderCell>종료 시간</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 120 }}>
                  예약 시간
                </Table.HeaderCell>
                <Table.HeaderCell style={{ width: 60 }}>삭제</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {timeRows.map((row, idx) => (
                <Table.Row key={row.id}>
                  <Table.Cell>{idx + 1}</Table.Cell>
                  <Table.Cell>
                    <DatePicker
                      onKeyDown={(e) => e.preventDefault()}
                      dateFormat={'yyyy-MM-dd'}
                      minDate={now.toDate()}
                      selected={row.date.toDate()}
                      onChange={(d) => {
                        const targetDate = moment(d).format('YYYY-MM-DD');
                        const nowDate = now.format('YYYY-MM-DD');
                        if (targetDate === nowDate) {
                          handleUpdateTimeRow(row.id, 'date', now);
                          handleUpdateTimeRow(row.id, 'startTime', now);
                          handleUpdateTimeRow(row.id, 'endTime', nowNext30Min);
                        } else {
                          const newDate = moment(targetDate + 'T00:00');
                          handleUpdateTimeRow(row.id, 'date', newDate);
                          handleUpdateTimeRow(
                            row.id,
                            'startTime',
                            moment(targetDate + 'T00:00'),
                          );
                          handleUpdateTimeRow(
                            row.id,
                            'endTime',
                            moment(targetDate + 'T00:30'),
                          );
                        }
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <DatePicker
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      onKeyDown={(e) => e.preventDefault()}
                      dateFormat={'hh:mm aa'}
                      selected={row.startTime.toDate()}
                      minTime={row.date.toDate()}
                      maxTime={moment(
                        row.date.format('YYYY-MM-DD') + 'T23:59',
                      ).toDate()}
                      onChange={(st) => {
                        const newStartTime = moment(st);
                        const newEndTime = moment(newStartTime).add(
                          30,
                          'minute',
                        );
                        handleUpdateTimeRow(row.id, 'startTime', newStartTime);
                        handleUpdateTimeRow(row.id, 'endTime', newEndTime);
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <DatePicker
                      showTimeSelect
                      showTimeSelectOnly
                      timeIntervals={30}
                      onKeyDown={(e) => e.preventDefault()}
                      dateFormat={'hh:mm aa'}
                      selected={row.endTime.toDate()}
                      minTime={moment(row.startTime).add(30, 'minute').toDate()}
                      maxTime={
                        row.endTime.format('HHmm') === '0000'
                          ? moment(
                              row.date.format('YYYY-MM-DD') + 'T00:00',
                            ).toDate()
                          : moment(
                              row.date.format('YYYY-MM-DD') + 'T23:59',
                            ).toDate()
                      }
                      onChange={(et) => {
                        handleUpdateTimeRow(row.id, 'endTime', moment(et));
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell
                    textAlign="center"
                    style={{ fontWeight: 'bold', fontSize: '15px' }}
                  >
                    {hourDiff(row.startTime, row.endTime)}시간
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <Button
                      type="button"
                      icon="trash"
                      color="red"
                      size="tiny"
                      disabled={timeRows.length <= 1}
                      onClick={() => handleRemoveTimeRow(row.id)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Segment>

        <Divider style={{ margin: '24px 0' }} />

        {/* 요약 및 제출 */}
        <Message
          positive={totalCombinations > 0}
          warning={totalCombinations === 0}
        >
          <Message.Header>
            총 {totalCombinations}개의 예약을 일괄 생성합니다.
          </Message.Header>
          <p>
            선택된 장소 {validPlaceRows.length}개 × 설정된 일시{' '}
            {timeRows.length}개 = 총 {totalCombinations}건의 장소 예약이
            등록됩니다.
          </p>
        </Message>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <Button
            type="button"
            onClick={() => router.push('/place/reservation')}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            primary
            size="large"
            loading={isSubmitting}
            disabled={isSubmitting || totalCombinations === 0}
            onClick={handleSubmit}
          >
            <Icon name="check" /> 일괄 예약 생성 ({totalCombinations}건)
          </Button>
        </div>
      </Form>

      {/* 결과 모달 */}
      <Modal
        open={isResultModalOpen}
        size="large"
        onClose={() => {
          if (!isProcessingBatch) setIsResultModalOpen(false);
        }}
      >
        <Modal.Header>
          <Icon name="tasks" /> 일괄 예약 생성 결과
        </Modal.Header>
        <Modal.Content scrolling>
          {isProcessingBatch && (
            <Message info>
              <Message.Header>일괄 예약을 생성하는 중입니다...</Message.Header>
              <p>잠시만 기다려 주세요.</p>
            </Message>
          )}

          {!isProcessingBatch && (
            <Message
              positive={taskItems.every((t) => t.status === 'success')}
              negative={taskItems.some((t) => t.status === 'error')}
            >
              <Message.Header>
                생성 완료: 성공{' '}
                {taskItems.filter((t) => t.status === 'success').length}건 /
                실패 {taskItems.filter((t) => t.status === 'error').length}건
              </Message.Header>
              {taskItems.some((t) => t.status === 'error') && (
                <p>
                  실패한 예약 항목의 원인이 아래 목록의 [에러 사유]에
                  표시됩니다.
                </p>
              )}
            </Message>
          )}

          <Table celled striped compact>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell style={{ width: 40 }}>#</Table.HeaderCell>
                <Table.HeaderCell style={{ width: 160 }}>
                  장소명
                </Table.HeaderCell>
                <Table.HeaderCell style={{ width: 220 }}>
                  예약 일시
                </Table.HeaderCell>
                <Table.HeaderCell style={{ width: 80 }}>상태</Table.HeaderCell>
                <Table.HeaderCell>에러 사유 / 비고</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {taskItems.map((task, idx) => (
                <Table.Row
                  key={task.id}
                  positive={task.status === 'success'}
                  negative={task.status === 'error'}
                >
                  <Table.Cell>{idx + 1}</Table.Cell>
                  <Table.Cell style={{ fontWeight: 'bold' }}>
                    {task.placeName}
                  </Table.Cell>
                  <Table.Cell>
                    {task.dateStr} ({task.startTimeStr} ~ {task.endTimeStr})
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    {task.status === 'pending' && (
                      <Icon name="clock outline" color="grey" title="대기" />
                    )}
                    {task.status === 'uploading' && (
                      <Icon
                        name="spinner"
                        loading
                        color="blue"
                        title="진행중"
                      />
                    )}
                    {task.status === 'success' && (
                      <Icon name="check circle" color="green" title="성공" />
                    )}
                    {task.status === 'error' && (
                      <Icon name="warning sign" color="red" title="실패" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {task.status === 'error' && (
                      <span style={{ color: '#db2828', fontWeight: 'bold' }}>
                        {task.errorMsg}
                      </span>
                    )}
                    {task.status === 'success' && (
                      <span style={{ color: '#21ba45' }}>생성 완료</span>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Modal.Content>
        <Modal.Actions>
          {!isProcessingBatch && (
            <Button
              primary
              onClick={() => {
                setIsResultModalOpen(false);
                router.push('/place/reservation');
              }}
            >
              목록으로 이동
            </Button>
          )}
        </Modal.Actions>
      </Modal>
    </ReservationLayout>
  );
};

export default PlaceReservationBulkCreatePage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('place');
  const placeList = res.data;

  return { props: { placeList } };
}
