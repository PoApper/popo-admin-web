import Link from 'next/link';
import { Button, Message } from 'semantic-ui-react';

import BoardLayout from '@/components/board/board.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import NoticeTable from '@/components/board/notice/notice.table';

const AnnouncementPage = ({ noticeList }) => {
  return (
    <BoardLayout>
      <h3>공지사항</h3>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={'/board/notice/create'}>
          <Button>공지사항 등록</Button>
        </Link>
      </div>

      <Message>공지사항은 빠른 게시 시작 일자로 정렬되어 표시됩니다!</Message>

      <Message warning>기능 개발이 계속 이뤄지고 있습니다.</Message>

      <div>
        <NoticeTable notices={noticeList} />
      </div>
    </BoardLayout>
  );
};

export default AnnouncementPage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('notice');
  const noticeList = res1.data;

  return { props: { noticeList } };
}
