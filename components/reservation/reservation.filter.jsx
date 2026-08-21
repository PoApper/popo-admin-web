import React from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';

import { PERIOD_OPTIONS } from '@/utils/reservation-period';

export const STATUS_OPTIONS = [
  { key: 'all', value: '', text: '전체' },
  { key: 'in_process', value: '심사중', text: '심사중' },
  { key: 'accept', value: '통과', text: '통과' },
  { key: 'reject', value: '거절', text: '거절' },
];

export const ORDER_OPTIONS = [
  { key: 'createdAt_DESC', value: 'createdAt_DESC', text: '생성일 최신순' },
  { key: 'createdAt_ASC', value: 'createdAt_ASC', text: '생성일 오래된순' },
  { key: 'date_ASC', value: 'date_ASC', text: '예약일 빠른순' },
  { key: 'date_DESC', value: 'date_DESC', text: '예약일 늦은순' },
];

/**
 * 예약 목록 필터. 장소/장비, 전체 목록/대기 목록이 함께 쓴다.
 *
 * 화면마다 필요한 칸이 달라서 `fields` 로 무엇을 보일지 정한다.
 * - 'resource' : 장소 또는 소유 기관 선택 (resource prop 필요)
 * - 'status'   : 예약 상태. 대기 목록은 항상 심사중이라 쓰지 않는다.
 * - 'period'   : 다가오는/지난/전체 프리셋
 * - 'dateRange': 예약일 시작~종료 직접 지정
 * - 'title'    : 예약 제목 부분 일치
 * - 'order'    : 정렬
 *
 * @param resource { name, label, options } 예: { name: 'placeId', label: '장소', options: [...] }
 */
const ReservationFilter = ({
  filter,
  onChange,
  onSubmit,
  onReset,
  resource,
  fields = ['resource', 'status', 'order', 'dateRange', 'title'],
}) => {
  const has = (field) => fields.includes(field);

  const handleChange = (event, { name, value }) => {
    onChange({ ...filter, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  const resourceOptions = resource
    ? [{ key: 'all', value: '', text: '전체' }, ...resource.options]
    : [];

  return (
    <Segment>
      <Form onSubmit={handleSubmit}>
        <Form.Group widths="equal">
          {has('resource') && resource && (
            <Form.Select
              search
              label={resource.label}
              name={resource.name}
              options={resourceOptions}
              value={filter[resource.name]}
              onChange={handleChange}
            />
          )}
          {has('period') && (
            <Form.Select
              label="기간"
              name="period"
              options={PERIOD_OPTIONS}
              value={filter.period}
              onChange={handleChange}
            />
          )}
          {has('status') && (
            <Form.Select
              label="상태"
              name="status"
              options={STATUS_OPTIONS}
              value={filter.status}
              onChange={handleChange}
            />
          )}
          {has('order') && (
            <Form.Select
              label="정렬"
              name="order"
              options={ORDER_OPTIONS}
              value={filter.order}
              onChange={handleChange}
            />
          )}
        </Form.Group>
        <Form.Group widths="equal">
          {has('dateRange') && (
            <>
              <Form.Input
                type="date"
                label="예약일 시작"
                name="startDate"
                value={filter.startDate}
                onChange={handleChange}
              />
              <Form.Input
                type="date"
                label="예약일 종료"
                name="endDate"
                value={filter.endDate}
                onChange={handleChange}
              />
            </>
          )}
          {has('title') && (
            <Form.Input
              label="예약 제목"
              name="title"
              placeholder="제목에 포함된 단어"
              value={filter.title}
              onChange={handleChange}
            />
          )}
        </Form.Group>
        <Button primary type="submit">
          검색
        </Button>
        <Button type="button" onClick={onReset}>
          초기화
        </Button>
      </Form>
    </Segment>
  );
};

export default ReservationFilter;
