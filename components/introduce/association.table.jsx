import moment from 'moment';
import Link from 'next/link';
import { Table } from 'semantic-ui-react';

const AssociationTable = (props) => {
  const associations = props.associations;

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
        {associations.map((association, idx) => (
          <Link
            href={`/introduce/association/update/${association.uuid}`}
            key={association.uuid}
          >
            <Table.Row key={association.uuid}>
              <Table.Cell>{idx + 1}</Table.Cell>
              <Table.Cell>{association.name}</Table.Cell>
              <Table.Cell>{association.location}</Table.Cell>
              <Table.Cell>{association.representative}</Table.Cell>
              <Table.Cell>{association.contact}</Table.Cell>
              <Table.Cell>{association.views}</Table.Cell>
              <Table.Cell>
                {moment(association.updateAt).format('YYYY-MM-DD HH:mm')}
              </Table.Cell>
            </Table.Row>
          </Link>
        ))}
      </Table.Body>
    </Table>
  );
};

export default AssociationTable;
