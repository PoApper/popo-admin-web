import moment from 'moment';
import { Table } from 'semantic-ui-react';
import WhitebookUpdateModal from './whitebook.update.modal';

const WhitebookTable = ({ whitebooks }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>번호</Table.HeaderCell>
          <Table.HeaderCell>제목</Table.HeaderCell>
          <Table.HeaderCell>내용</Table.HeaderCell>
          <Table.HeaderCell>생성일</Table.HeaderCell>
          <Table.HeaderCell>조회수</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {whitebooks.map((whitebook, idx) => (
          <WhitebookUpdateModal
            key={whitebook.uuid}
            whitebook={whitebook}
            trigger={
              <Table.Row key={whitebook.uuid}>
                <Table.Cell>{idx + 1}</Table.Cell>
                <Table.Cell>
                  <a href={whitebook.link} target={'_blank'} rel={'noreferrer'}>
                    {whitebook.title}
                  </a>
                </Table.Cell>
                <Table.Cell>{whitebook.content}</Table.Cell>
                <Table.Cell>
                  {moment(whitebook.createdAt).format('YYYY-MM-DD HH:mm')}
                </Table.Cell>
                <Table.Cell>{whitebook.clickCount}</Table.Cell>
              </Table.Row>
            }
          />
        ))}
      </Table.Body>
    </Table>
  );
};

export default WhitebookTable;
