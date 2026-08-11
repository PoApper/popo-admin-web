import { useEffect, useState } from 'react';
import moment from 'moment';

import { PoPoAxios } from '@/utils/axios.instance';

const ACTION_LABEL = {
  accept: '승인',
  reject: '거절',
};

function buildResultMessage(action, result) {
  const { acceptedCount, skippedCount, skippedList } = result;
  const label = ACTION_LABEL[action];

  const lines = [
    `${label} ${acceptedCount}건, 건너뜀 ${skippedCount}건 처리했습니다.`,
  ];

  if (skippedCount) {
    lines.push('');
    lines.push('[건너뛴 예약]');
    skippedList.forEach((skipped) => {
      const date = skipped.date
        ? moment(skipped.date, 'YYYYMMDD').format('YYYY-MM-DD')
        : '';
      const startTime = skipped.startTime
        ? moment(skipped.startTime, 'HHmm').format('HH:mm')
        : '';
      const endTime = skipped.endTime
        ? moment(skipped.endTime, 'HHmm').format('HH:mm')
        : '';
      lines.push(
        `- ${skipped.title} (${date} ${startTime}~${endTime}): ${skipped.reason}`,
      );
    });
  }

  return lines.join('\n');
}

/**
 * 예약 일괄 승인/거절의 선택 상태와 요청을 관리한다. 장소/장비 대기 목록이 함께 쓴다.
 *
 * @param resource 'reservation-place' 또는 'reservation-equip'
 * @param reservations 현재 보이는 예약 목록
 */
export function useBulkAccept(resource, reservations) {
  const [selectedUuidList, setSelectedUuidList] = useState([]);
  // 어떤 동작이 진행 중인지('accept' | 'reject' | null). 버튼별 로딩 표시에 쓴다.
  const [submittingAction, setSubmittingAction] = useState(null);

  // 필터가 바뀌어 목록이 갈리면 이전 선택이 남지 않도록 초기화한다.
  useEffect(() => {
    setSelectedUuidList([]);
  }, [reservations]);

  const isAllSelected =
    reservations.length > 0 && selectedUuidList.length === reservations.length;

  function toggle(uuid) {
    setSelectedUuidList((currentList) =>
      currentList.includes(uuid)
        ? currentList.filter((selected) => selected !== uuid)
        : currentList.concat(uuid),
    );
  }

  function toggleAllInPage() {
    setSelectedUuidList(
      isAllSelected ? [] : reservations.map((reservation) => reservation.uuid),
    );
  }

  function select(uuidList) {
    setSelectedUuidList(uuidList);
  }

  async function run(action) {
    const label = ACTION_LABEL[action];

    if (selectedUuidList.length === 0) {
      alert(`일괄 ${label}할 예약을 먼저 선택해주세요.`);
      return;
    }

    // 거절은 되돌리기 번거로우니 한 번 확인한다.
    if (
      action === 'reject' &&
      !confirm(`선택한 ${selectedUuidList.length}건을 일괄 거절할까요?`)
    ) {
      return;
    }

    setSubmittingAction(action);
    try {
      const res = await PoPoAxios.patch(`/${resource}/all/status/${action}`, {
        uuidList: selectedUuidList,
      });
      alert(buildResultMessage(action, res.data));
      window.location.reload();
    } catch (err) {
      const errMsg = err.response?.data?.message ?? err.message;
      alert(`전체 예약 ${label}에 실패했습니다.\n${errMsg}`);
    } finally {
      setSubmittingAction(null);
    }
  }

  return {
    selectedUuidList,
    isAllSelected,
    isSubmitting: submittingAction !== null,
    submittingAction,
    toggle,
    toggleAllInPage,
    select,
    submit: () => run('accept'),
    reject: () => run('reject'),
  };
}
