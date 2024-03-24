import Link from 'next/link';
import moment from 'moment';
import { Table } from 'semantic-ui-react';

const NoticeTable = ({ notices }) => {
  return (
    <Table celled selectable textAlign={'center'}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell width={1}>id.</Table.HeaderCell>
          <Table.HeaderCell width={4}>제목</Table.HeaderCell>
          <Table.HeaderCell width={6}>내용</Table.HeaderCell>
          {/* <Table.HeaderCell>이미지</Table.HeaderCell> */}
          <Table.HeaderCell width={5}>게시 일자</Table.HeaderCell>
          <Table.HeaderCell width={1}>클릭수</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {notices.map((notice) => {
          const isActive = moment().isBetween(
            moment(notice.start_datetime),
            moment(notice.end_datetime),
          );
          const duration = moment(notice.end_datetime).diff(
            moment(notice.start_datetime),
            'hours',
          );
          return (
            <Link href={`/board/notice/update/${notice.id}`} key={notice.id}>
              <Table.Row key={notice.id} positive={isActive}>
                <Table.Cell>{notice.id}</Table.Cell>
                <Table.Cell>
                  {notice.link ? (
                    <a href={notice.link} target={'_blank'} rel={'noreferrer'}>
                      {notice.title}
                    </a>
                  ) : (
                    notice.title
                  )}
                </Table.Cell>
                <Table.Cell
                  style={{ whiteSpace: 'pre-line', textAlign: 'left' }}
                >
                  {notice.content}
                </Table.Cell>
                {/* <Table.Cell>
                    <Image href={notice.link}/>
                  </Table.Cell> */}
                <Table.Cell>
                  {moment(notice.start_datetime).format('YYYY-MM-DD HH:mm')} ~{' '}
                  {moment(notice.end_datetime).format('YYYY-MM-DD HH:mm')}
                  <br />({Number(duration / 24).toFixed(0)}일 {duration % 24}
                  시간)
                </Table.Cell>
                <Table.Cell>{notice.click_count}</Table.Cell>
              </Table.Row>
            </Link>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default NoticeTable;
