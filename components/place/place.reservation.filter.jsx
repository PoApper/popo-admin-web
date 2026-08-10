import React from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';

const STATUS_OPTIONS = [
  { key: 'all', value: '', text: '전체' },
  { key: 'in_process', value: '심사중', text: '심사중' },
  { key: 'accept', value: '통과', text: '통과' },
  { key: 'reject', value: '거절', text: '거절' },
];

const ORDER_OPTIONS = [
  { key: 'createdAt_DESC', value: 'createdAt_DESC', text: '생성일 최신순' },
  { key: 'createdAt_ASC', value: 'createdAt_ASC', text: '생성일 오래된순' },
  { key: 'date_ASC', value: 'date_ASC', text: '예약일 빠른순' },
  { key: 'date_DESC', value: 'date_DESC', text: '예약일 늦은순' },
];

/**
 * 장소 예약 목록 필터.
 * 예약 건수가 많아 생성일 순 나열만으로는 승인 대상을 찾기 어려워 추가되었다.
 */
const PlaceReservationFilter = ({
  filter,
  places = [],
  onChange,
  onSubmit,
  onReset,
}) => {
  const placeOptions = [
    { key: 'all', value: '', text: '전체' },
    ...places.map((place) => ({
      key: place.uuid,
      value: place.uuid,
      text: place.name,
    })),
  ];

  const handleChange = (event, { name, value }) => {
    onChange({ ...filter, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Segment>
      <Form onSubmit={handleSubmit}>
        <Form.Group widths="equal">
          <Form.Select
            search
            label="장소"
            name="placeId"
            options={placeOptions}
            value={filter.placeId}
            onChange={handleChange}
          />
          <Form.Select
            label="상태"
            name="status"
            options={STATUS_OPTIONS}
            value={filter.status}
            onChange={handleChange}
          />
          <Form.Select
            label="정렬"
            name="order"
            options={ORDER_OPTIONS}
            value={filter.order}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group widths="equal">
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
          <Form.Input
            label="예약 제목"
            name="title"
            placeholder="제목에 포함된 단어"
            value={filter.title}
            onChange={handleChange}
          />
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

export default PlaceReservationFilter;
