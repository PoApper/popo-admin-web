import moment from 'moment'
import { Table } from 'semantic-ui-react'
import ClubUpdateModal from './club.update.modal'

const ClubTable = (props) => {
  const clubs = props.clubs

  return (
    <Table
      celled selectable
      textAlign={'center'}
    >
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>idx.</Table.HeaderCell>
          <Table.HeaderCell>단체명</Table.HeaderCell>
          <Table.HeaderCell>위치</Table.HeaderCell>
          <Table.HeaderCell>단체장</Table.HeaderCell>
          <Table.HeaderCell>연락처</Table.HeaderCell>
          <Table.HeaderCell>마지막 수정일</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {
          clubs.map((club, idx) =>
              <ClubUpdateModal
                key={club.uuid}
                club={club}
                trigger={
                  <Table.Row key={club.uuid}>
                    <Table.Cell>{idx + 1}</Table.Cell>
                    <Table.Cell>{club.name}</Table.Cell>
                    <Table.Cell>{club.location}</Table.Cell>
                    <Table.Cell>{club.representative}</Table.Cell>
                    <Table.Cell>{club.contact}</Table.Cell>
                    <Table.Cell>
                      {moment(club.updateAt).
                        format('YYYY-MM-DD HH:mm')}
                    </Table.Cell>
                  </Table.Row>
                }
              />
          )
        }
      </Table.Body>
    </Table>
  )
}

export default ClubTable