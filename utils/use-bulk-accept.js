import { useEffect, useState } from 'react';
import moment from 'moment';

import { PoPoAxios } from '@/utils/axios.instance';

function buildResultMessage(result) {
  const { acceptedCount, skippedCount, skippedList } = result;

  const lines = [
    `승인 ${acceptedCount}건, 건너뜀 ${skippedCount}건 처리했습니다.`,
  ];

  if (skippedCount) {
    lines.push('');
    lines.push('[건너뛴 예약]');
    skippedList.forEach((skipped) => {
      const date = moment(skipped.date, 'YYYYMMDD').format('YYYY-MM-DD');
      const startTime = moment(skipped.startTime, 'HHmm').format('HH:mm');
      const endTime = moment(skipped.endTime, 'HHmm').format('HH:mm');
      lines.push(
        `- ${skipped.title} (${date} ${startTime}~${endTime}): ${skipped.reason}`,
      );
    });
  }

  return lines.join('\n');
}

/**
 * 예약 일괄 승인 선택 상태와 요청을 관리한다. 장소/장비 대기 목록이 함께 쓴다.
 *
 * @param resource 'reservation-place' 또는 'reservation-equip'
 * @param reservations 현재 페이지에 보이는 예약 목록
 */
export function useBulkAccept(resource, reservations) {
  const [selectedUuidList, setSelectedUuidList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 페이지를 넘기거나 필터가 바뀌면 이전 페이지의 선택이 남지 않도록 초기화한다.
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

  async function submit() {
    if (selectedUuidList.length === 0) {
      alert('일괄 승인할 예약을 먼저 선택해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await PoPoAxios.patch(`/${resource}/all/status/accept`, {
        uuidList: selectedUuidList,
      });
      alert(buildResultMessage(res.data));
      window.location.reload();
    } catch (err) {
      const errMsg = err.response?.data?.message ?? err.message;
      alert(`전체 예약 승인에 실패했습니다.\n${errMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    selectedUuidList,
    isAllSelected,
    isSubmitting,
    toggle,
    toggleAllInPage,
    select,
    submit,
  };
}
