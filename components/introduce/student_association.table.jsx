import moment from 'moment';
import Link from 'next/link';
import { Icon, Table } from 'semantic-ui-react';

const StudentAssociationTable = ({ studentAssociations }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell>단체명</Table.HeaderCell>
          <Table.HeaderCell>짧은 설명</Table.HeaderCell>
          <Table.HeaderCell>위치</Table.HeaderCell>
          <Table.HeaderCell>협력 행정팀</Table.HeaderCell>
          <Table.HeaderCell>대표자</Table.HeaderCell>
          <Table.HeaderCell>연락처</Table.HeaderCell>
          <Table.HeaderCell>조회수</Table.HeaderCell>
          <Table.HeaderCell>마지막 수정일</Table.HeaderCell>
          <Table.HeaderCell></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {studentAssociations.map((studentAssociation, idx) => (
          <Table.Row key={studentAssociation.uuid}>
            <Table.Cell>{idx + 1}</Table.Cell>
            <Table.Cell>{studentAssociation.name}</Table.Cell>
            <Table.Cell>{studentAssociation.shortDesc}</Table.Cell>
            <Table.Cell>{studentAssociation.location}</Table.Cell>
            <Table.Cell>{studentAssociation.office}</Table.Cell>
            <Table.Cell>{studentAssociation.representative}</Table.Cell>
            <Table.Cell>{studentAssociation.contact}</Table.Cell>
            <Table.Cell>{studentAssociation.views}</Table.Cell>
            <Table.Cell>
              {moment(studentAssociation.updateAt).format('YYYY-MM-DD HH:mm')}
            </Table.Cell>
            <Table.Cell>
              <Link
                href={`/introduce/student_association/update/${studentAssociation.uuid}`}
              >
                <Icon name={'edit'} />
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default StudentAssociationTable;
