import Link from 'next/link';
import { Button, Message } from 'semantic-ui-react';

import BoardLayout from '@/components/board/board.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import CalendarTable from '@/components/board/calendar/calendar.table';

const AnnouncementPage = ({ calendarList }) => {
  return (
    <BoardLayout>
      <h3>학사 일정</h3>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Link href={'/board/calendar/create'}>
          <Button>학사일정 추가</Button>
        </Link>

        <Button
          href={
            'https://www.postech.ac.kr/kor/college-life/academic_schedule.do'
          }
          style={{ backgroundColor: 'rgb(200, 1, 80)', color: 'white' }}
        >
          공식 학사일정 확인하기
        </Button>
      </div>

      <Message>학사일정은 시작 일자로 정렬되어 표시됩니다!</Message>
      <Message>
        만약 이틀 이상 진행되는 일정이라면 <b>시작/종료</b> 일정으로
        분리해주세요. <br />
        (ex. 2학기 수강 신청 (05.20 ~ 05.28) → 2학기 수강신청 수강신청
        시작(05.20) / 2학기 수강신청 마감(05.28))
      </Message>

      <div>
        <CalendarTable calendars={calendarList} />
      </div>
    </BoardLayout>
  );
};

export default AnnouncementPage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('calendar');
  const calendarList = res1.data;

  return { props: { calendarList } };
}
