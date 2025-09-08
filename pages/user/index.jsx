import { useEffect, useState } from 'react';
import { Button, Icon, Input, Pagination } from 'semantic-ui-react';

import LayoutWithAuth from '@/components/layout/layout.auth.with';
import UserTable from '@/components/user/user.table';
import UserCreateModal from '@/components/user/user.create.modal';
import { PoPoAxios } from '@/utils/axios.instance';

const UserPage = ({
  totalUserCnt,
  todayRegisterUserCnt,
  todayLoginUserCnt,
  thisWeekRegisterUserCnt,
  thisWeekLoginUserCnt,
}) => {
  const PAGE_SIZE = 10;

  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const [totalCount, setTotalCount] = useState(0);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const skip = PAGE_SIZE * (page - 1);
    PoPoAxios.get(
      `/search/user?q=${keyword}&take=${PAGE_SIZE}&skip=${skip}`,
    ).then((res) => {
      const ret = res.data;
      setUsers(ret['users']);
      setTotalCount(ret['count']);
    });
  }, [keyword, page]);

  return (
    <LayoutWithAuth>
      <h2>유저 관리</h2>

      <div style={{ marginBottom: '1rem' }}>
        <UserCreateModal trigger={<Button>유저 생성</Button>} />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <Input
          icon={<Icon name="search" inverted circular link />}
          style={{ width: 300 }}
          placeholder={'찾으려는 유저를 검색하세요...'}
          onChange={(_, { value }) => setKeyword(value)}
        />
      </div>

      <ul style={{ padding: '0 0 0 20px' }}>
        <li>총 유저 수: {Number(totalUserCnt).toLocaleString()}명</li>
        <li>
          오늘 가입한 유저 수: {Number(todayRegisterUserCnt).toLocaleString()}명
        </li>
        <li>
          오늘 로그인한 유저 수: {Number(todayLoginUserCnt).toLocaleString()}명
        </li>
        <li>
          이번 주 가입한 유저 수:{' '}
          {Number(thisWeekRegisterUserCnt).toLocaleString()}명
        </li>
        <li>
          이번 주 로그인한 유저 수:{' '}
          {Number(thisWeekLoginUserCnt).toLocaleString()}명
        </li>
      </ul>

      <p>유저는 마지막 로그인 순으로 정렬되어 표시됩니다.</p>

      <div>
        <UserTable users={users} startIdx={(page - 1) * PAGE_SIZE} />
        <div style={{ display: 'flex' }}>
          <Pagination
            style={{ margin: '0 auto' }}
            activePage={page}
            totalPages={Math.ceil(totalCount / PAGE_SIZE)}
            prevItem={null}
            nextItem={null}
            onPageChange={(_, { activePage }) => setPage(activePage)}
          />
        </div>
      </div>
    </LayoutWithAuth>
  );
};

export default UserPage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('statistics/user/count');
  const userCntStats = res.data;

  const {
    totalUserCnt,
    todayRegisterUserCnt,
    todayLoginUserCnt,
    thisWeekRegisterUserCnt,
    thisWeekLoginUserCnt,
  } = userCntStats;

  return {
    props: {
      totalUserCnt,
      todayRegisterUserCnt,
      todayLoginUserCnt,
      thisWeekRegisterUserCnt,
      thisWeekLoginUserCnt,
    },
  };
}
