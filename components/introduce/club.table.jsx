import moment from 'moment';
import Link from 'next/link';
import { Table } from 'semantic-ui-react';

const ClubTable = ({ clubs }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell>단체명</Table.HeaderCell>
          <Table.HeaderCell>위치</Table.HeaderCell>
          <Table.HeaderCell>단체장</Table.HeaderCell>
          <Table.HeaderCell>연락처</Table.HeaderCell>
          <Table.HeaderCell>조회수</Table.HeaderCell>
          <Table.HeaderCell>마지막 수정일</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {clubs.map((club, idx) => (
          <Link href={`/introduce/club/update/${club.uuid}`} key={club.uuid}>
            <Table.Row key={club.uuid}>
              <Table.Cell>{idx + 1}</Table.Cell>
              <Table.Cell>{club.name}</Table.Cell>
              <Table.Cell>{club.location}</Table.Cell>
              <Table.Cell>{club.representative}</Table.Cell>
              <Table.Cell>{club.contact}</Table.Cell>
              <Table.Cell>{club.views}</Table.Cell>
              <Table.Cell>
                {moment(club.updateAt).format('YYYY-MM-DD HH:mm')}
              </Table.Cell>
            </Table.Row>
          </Link>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ClubTable;
