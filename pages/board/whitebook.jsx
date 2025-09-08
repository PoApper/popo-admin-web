import { useState, useEffect } from 'react';
import { Button } from 'semantic-ui-react';

import BoardLayout from '@/components/board/board.layout';
import WhitebookCreateModal from '@/components/board/whitebook/whitebook.create.modal';
import WhitebookTable from '@/components/board/whitebook/whitebook.table';
import { PoPoAxios } from '@/utils/axios.instance';

const WhitebookPage = () => {
  const [whitebooks, setWhitebooks] = useState([]);

  useEffect(() => {
    PoPoAxios.get('/whitebook/with-login?orderBy=clickCount')
      .then((res) => setWhitebooks(res.data))
      .catch((err) => {
        alert('생활백서 목록을 불러오는데 실패했습니다.');
        console.log(err);
      });
  }, []);

  return (
    <BoardLayout>
      <h3>생활백서</h3>
      <div style={{ marginBottom: '1rem' }}>
        <WhitebookCreateModal trigger={<Button>생활백서 생성</Button>} />
      </div>
      <p>
        생활백서는 조회순으로 정렬되어 표시됩니다. 박스 안을 클릭하면 수정할 수
        있습니다.
      </p>
      <div>
        <WhitebookTable whitebooks={whitebooks} />
      </div>
    </BoardLayout>
  );
};

export default WhitebookPage;

// TODO: cookie 이슈로 SSR 적용시 UnAuth 401 뜸.
// export async function getServerSideProps(context) {
//   const { cookie } = context.req.headers;

//   try {
//     const res = await PoPoAxios.get(
//       'whitebook/with-login?orderBy=clickCount',
//       { headers: cookie ? { cookie: cookie.toString() } : null }
//     );
//     const whitebookList = res.data;
//     return { props: { whitebookList } };
//   } catch ({ response }) {
//     return { props: { error: response.data}}
//   }
// }
