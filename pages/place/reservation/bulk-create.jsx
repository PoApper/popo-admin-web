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

  // --------------------------------------------------------------------------
  // 유효성 / 중복 검사 (실시간 UI 바인딩)
  // --------------------------------------------------------------------------

  // 1) 장소 중복 체크: 선택된 장소(uuid)가 다른 행에도 존재하는지 확인
  const isPlaceRowDuplicate = (row) => {
    if (!row.placeInfo) return false;
    return placeRows.some(
      (r) => r.id !== row.id && r.placeInfo?.uuid === row.placeInfo.uuid,
    );
  };

  const hasDuplicatePlace = placeRows.some((r) => isPlaceRowDuplicate(r));

  // 2) 일시 겹침 체크: 동일 날짜에서 다른 행과 시간대가 겹치는지 확인
  const isTimeRowOverlapping = (row) => {
    return timeRows.some((r) => {
      if (r.id === row.id) return false;
      if (r.date.format('YYYY-MM-DD') !== row.date.format('YYYY-MM-DD'))
        return false;

      const s1 = parseInt(row.startTime.format('HHmm'), 10);
      const e1 = parseInt(row.endTime.format('HHmm'), 10);
      const s2 = parseInt(r.startTime.format('HHmm'), 10);
      const e2 = parseInt(r.endTime.format('HHmm'), 10);

      return s1 < e2 && s2 < e1;
    });
  };

  const hasOverlappingTime = timeRows.some((r) => isTimeRowOverlapping(r));

  // 3) 장소별 하루 최대 예약 시간(maxMinutes) 초과 체크
  const validPlaceRows = placeRows.filter((r) => r.placeInfo !== null);
  const totalCombinations = validPlaceRows.length * timeRows.length;

  let hasMaxMinutesExceeded = false;
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

    for (const sumMins of Object.values(dateMap)) {
      if (sumMins > place.maxMinutes) {
        hasMaxMinutesExceeded = true;
        break;
      }
    }
  }

  const hasValidationError =
    hasDuplicatePlace || hasOverlappingTime || hasMaxMinutesExceeded;

  const handleSubmit = async () => {
    if (!phone.trim()) {
      alert('전화번호를 입력해 주세요.');
      return;
    }
    if (!title.trim() || title.length === 1) {
      alert('올바른 예약 제목을 입력해 주세요.');
      return;
    }
    if (!description.trim() || description.length === 1) {
      alert('올바른 예약 설명을 입력해 주세요.');
      return;
    }
    if (validPlaceRows.length === 0) {
      alert('최소 1개 이상의 장소를 선택해 주세요.');
      return;
    }
    if (timeRows.length === 0) {
      alert('최소 1개 이상의 일시를 설정해 주세요.');
      return;
    }
    if (hasValidationError) {
      alert('빨간색으로 표시된 중복 및 시간 겹침 에러 항목을 수정해 주세요.');
      return;
    }

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

                const isDup = isPlaceRowDuplicate(row);

                return (
                  <Table.Row key={row.id} negative={isDup}>
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
                        error={isDup}
                        options={placeOptions}
                        value={row.placeInfo}
                        onChange={(e, { value }) =>
                          handleUpdatePlaceInfo(row.id, value)
                        }
                        placeholder="장소 선택"
                      />
                      {isDup && (
                        <div
                          style={{
                            color: '#db2828',
                            fontWeight: 'bold',
                            fontSize: '0.85rem',
                            marginTop: 4,
                          }}
                        >
                          ⚠️ 중복 선택된 장소입니다. 다른 장소를 선택하거나 행을
                          삭제해 주세요.
                        </div>
                      )}
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
              {timeRows.map((row, idx) => {
                const isOverlap = isTimeRowOverlapping(row);

                return (
                  <Table.Row key={row.id} negative={isOverlap}>
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
                            handleUpdateTimeRow(
                              row.id,
                              'endTime',
                              nowNext30Min,
                            );
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
                          handleUpdateTimeRow(
                            row.id,
                            'startTime',
                            newStartTime,
                          );
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
                        minTime={moment(row.startTime)
                          .add(30, 'minute')
                          .toDate()}
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
                      {isOverlap && (
                        <div
                          style={{
                            color: '#db2828',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            marginTop: 4,
                          }}
                        >
                          ⚠️ 시간 겹침 에러
                        </div>
                      )}
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
                );
              })}
            </Table.Body>
          </Table>
        </Segment>

        <Divider style={{ margin: '24px 0' }} />

        {/* 유효성 오류 메시지 배너 */}
        {hasDuplicatePlace && (
          <Message negative style={{ marginBottom: 16 }}>
            <Message.Header>⚠️ 중복 선택된 장소가 있습니다.</Message.Header>
            <p>
              장소 목록 중 빨간색으로 표시된 행을 확인 후 중복된 장소를
              수정하거나 삭제해 주세요.
            </p>
          </Message>
        )}

        {hasOverlappingTime && (
          <Message negative style={{ marginBottom: 16 }}>
            <Message.Header>⚠️ 예약 시간 겹침 에러가 있습니다.</Message.Header>
            <p>
              일시 목록 중 빨간색으로 표시된 행을 확인 후 시간을 수정해 주세요.
            </p>
          </Message>
        )}

        {hasMaxMinutesExceeded && (
          <Message negative style={{ marginBottom: 16 }}>
            <Message.Header>⚠️ 하루 최대 예약 시간 초과</Message.Header>
            <p>
              장소의 하루 최대 예약 허용 시간(`maxMinutes`)을 초과하는 예약 일시
              조합이 포함되어 있습니다.
            </p>
          </Message>
        )}

        {/* 요약 및 제출 */}
        <Message
          positive={totalCombinations > 0 && !hasValidationError}
          warning={totalCombinations === 0}
          negative={hasValidationError}
        >
          <Message.Header>
            {hasValidationError
              ? '입력오류가 있어 예약을 생성할 수 없습니다.'
              : `총 ${totalCombinations}개의 예약을 일괄 생성합니다.`}
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
            disabled={
              isSubmitting || totalCombinations === 0 || hasValidationError
            }
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
