import Link from 'next/link';
import moment from 'moment';
import { Icon, Table } from 'semantic-ui-react';

const CalendarTable = ({ calendars }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={6}>제목</Table.HeaderCell>
          <Table.HeaderCell width={4}>날짜</Table.HeaderCell>
          <Table.HeaderCell width={2}>D-Day</Table.HeaderCell>
          <Table.HeaderCell width={2}></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {calendars.map((calendar) => {
          const isDisabled = moment().isAfter(moment(calendar.eventDate));
          const dDay = moment(calendar.eventDate).diff(
            moment().format('YYYY-MM-DD'),
            'days',
          );

          return (
            <Table.Row key={calendar.id} disabled={isDisabled}>
              <Table.Cell>
                {calendar.link ? (
                  <a href={calendar.link} target={'_blank'} rel={'noreferrer'}>
                    {calendar.title}
                  </a>
                ) : (
                  calendar.title
                )}
              </Table.Cell>
              <Table.Cell>{calendar.eventDate}</Table.Cell>
              <Table.Cell>
                {dDay > 0 ? `D-${dDay}` : dDay < 0 ? `D+${-dDay}` : 'D-Day'}
              </Table.Cell>
              <Table.Cell>
                <Link href={`/board/calendar/update/${calendar.id}`}>
                  <Icon name={'edit'} />
                </Link>
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default CalendarTable;
