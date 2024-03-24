import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Table } from 'semantic-ui-react';

const AffiliateTable = ({ affiliateList }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={1}>id</Table.HeaderCell>
          <Table.HeaderCell width={2}>업체명</Table.HeaderCell>
          <Table.HeaderCell width={4}>짤은 설명</Table.HeaderCell>
          <Table.HeaderCell width={6}>설명</Table.HeaderCell>
          <Table.HeaderCell width={2}>생성일</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {affiliateList.map((affiliate) => (
          <Link
            href={`benefit/affiliate/update/${affiliate.id}`}
            key={affiliate.id}
          >
            <Table.Row>
              <Table.Cell>{affiliate.id}</Table.Cell>
              <Table.Cell>{affiliate.title}</Table.Cell>
              <Table.Cell>{affiliate.content_short}</Table.Cell>
              <Table.Cell>{affiliate.content}</Table.Cell>
              <Table.Cell>
                {moment(affiliate.created_at).format('YYYY-MM-DD HH:mm')}
              </Table.Cell>
            </Table.Row>
          </Link>
        ))}
      </Table.Body>
    </Table>
  );
};

export default AffiliateTable;
