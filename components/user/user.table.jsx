import { Table } from 'semantic-ui-react';
import moment from 'moment';
import UserUpdateModal from './user.update.modal';

const userTypes = {
  STUDENT: '학생',
  RC_STUDENT: 'RC 학부생',
  FACULTY: '교직원',
  CLUB: '동아리',
  ASSOCIATION: '학생단체',
  ADMIN: '관리자',
  STAFF: 'Staff',
  OTHERS: 'OTHERS',
};

const UserTable = ({ users, startIdx }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell>이름</Table.HeaderCell>
          <Table.HeaderCell>유저 타입</Table.HeaderCell>
          <Table.HeaderCell>가입일</Table.HeaderCell>
          <Table.HeaderCell>마지막 로그인</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user, idx) => {
          return (
            <UserUpdateModal
              key={user.uuid}
              user={user}
              trigger={
                <Table.Row key={user.uuid}>
                  <Table.Cell>{startIdx + idx + 1}</Table.Cell>
                  <Table.Cell>{user.name}</Table.Cell>
                  <Table.Cell>{userTypes[user.userType]}</Table.Cell>
                  <Table.Cell>
                    {moment(user.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Table.Cell>
                  <Table.Cell>
                    {moment(user.lastLoginAt).format('YYYY-MM-DD HH:mm')}
                  </Table.Cell>
                </Table.Row>
              }
            />
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default UserTable;
