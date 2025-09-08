import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Icon, Table } from 'semantic-ui-react';

const DiscountTable = ({ discountList }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={1}>id</Table.HeaderCell>
          <Table.HeaderCell width={2}>업체명</Table.HeaderCell>
          <Table.HeaderCell width={1}>지역</Table.HeaderCell>
          <Table.HeaderCell width={2}>영업 시간</Table.HeaderCell>
          <Table.HeaderCell width={2}>가게 번호</Table.HeaderCell>
          <Table.HeaderCell width={6}>할인 내용</Table.HeaderCell>
          <Table.HeaderCell width={2}>생성일</Table.HeaderCell>
          <Table.HeaderCell width={2}></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {discountList.map((discount) => (
          <Table.Row key={discount.id}>
            <Table.Cell>{discount.id}</Table.Cell>
            <Table.Cell>{discount.title}</Table.Cell>
            <Table.Cell>{discount.region}</Table.Cell>
            <Table.Cell>{discount.openHour}</Table.Cell>
            <Table.Cell>{discount.phone}</Table.Cell>
            <Table.Cell>{discount.content}</Table.Cell>
            <Table.Cell>
              {moment(discount.createdAt).format('YYYY-MM-DD HH:mm')}
            </Table.Cell>
            <Table.Cell>
              <Link href={`/board/benefit/discount/update/${discount.id}`}>
                <Icon name={'edit'} />
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default DiscountTable;
