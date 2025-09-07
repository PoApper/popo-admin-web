import { Table } from 'semantic-ui-react';

const RcUserTable = ({ userStatusList }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell>이름</Table.HeaderCell>
          <Table.HeaderCell>이메일</Table.HeaderCell>
          <Table.HeaderCell>POPO 이름</Table.HeaderCell>
          <Table.HeaderCell>POPO 가입일</Table.HeaderCell>
          <Table.HeaderCell>POPO 유저타입</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {userStatusList.map((userStatus, idx) => {
          return (
            <Table.Row
              key={userStatus.uuid}
              negative={userStatus.status === 'not_registered'}
            >
              <Table.Cell>{idx + 1}</Table.Cell>
              <Table.Cell>{userStatus.name}</Table.Cell>
              <Table.Cell>{userStatus.email}</Table.Cell>
              <Table.Cell>{userStatus.userName}</Table.Cell>
              <Table.Cell>{userStatus.createdAt}</Table.Cell>
              <Table.Cell>{userStatus.userType}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default RcUserTable;
