import { useEffect, useState } from 'react';
import { Button } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import CsvUploadForm from '@/components/common/csv-upload.form';
import RcUserTable from '@/components/user/rc-user.table';

const RcStudentsListPage = ({ popoRcStdntCnt, totalRcStdntCnt }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [rcStudentStatusList, setRcStudentStatusList] = useState([]);

  useEffect(() => {
    PoPoAxios.get('/setting/get-rc-students-status')
      .then((res) => {
        setRcStudentStatusList(res.data);
        setIsLoaded(true);
      })
      .catch((err) => {
        alert(
          `RC 사생 명단을 불러오는데 실패했습니다.\n${err.response.data.message}`,
        );
      });
  }, [popoRcStdntCnt, totalRcStdntCnt]);

  return (
    <BoardLayout>
      <h3>RC 사생 명단 업로드</h3>
      <p style={{ lineHeight: '1.6em' }}>
        RC 사생에게만 RC 장소 예약을 받기 위해 RC 사생 명단 정보가 필요합니다.
        <br />
        아래 주소에서 CSV 파일을 다운받아 이 형식에 맞춰 입력 후, 다시 CSV
        파일을 업로드해주세요.
        <span style={{ color: 'red' }}>(name, email 컬럼은 필수입니다.)</span>
        <br />
        CSV 파일이 업로드되면, RC 사생 명단 초기화(reset) 후 업로드된 명단에
        있는 Povis ID를 가진 모든 유저를 RC 사생으로 분류합니다.
        <br />
        만약 RC 사생 명단을 업로드 한 후에, RC 사생이 가입한다면 그때는{' '}
        <strong>자동</strong>으로 RC 사생으로 분류됩니다.
      </p>

      <ul>
        <li>
          POPO 가입 RC 사생 수: {popoRcStdntCnt}명 (
          {Number(((popoRcStdntCnt / totalRcStdntCnt) * 100).toFixed(1))}%)
        </li>
        <li>전체 RC 사생 수: {totalRcStdntCnt}명</li>
      </ul>

      <div style={{ marginTop: 4, gap: 8 }}>
        <Button
          size="tiny"
          href={`${PoPoAxios.getUri()}/setting/download-rc-students-list`}
        >
          RC 명단 다운로드
        </Button>

        <Button
          size="tiny"
          onClick={() => {
            PoPoAxios.get('/setting/sync-rc-students-list')
              .then(() => {
                alert('싱크에 성공했습니다.');
                window.location.reload();
              })
              .catch((err) => {
                const errMsg = err.response.data.message;
                alert(`목록 싱크에 실패했습니다.\n${errMsg}`);
              });
          }}
        >
          업로드한 RC 명단을 기준으로 다시 적용하기
        </Button>
      </div>

      <div style={{ marginTop: 12 }}>
        <CsvUploadForm
          label={'RC 사생 명단'}
          uploadUri={'/setting/rc-students-list'}
        />
      </div>

      <div style={{ marginTop: 12 }}>
        {isLoaded ? (
          <>
            <h3>RC 사생 명단</h3>
            <RcUserTable userStatusList={rcStudentStatusList} />
          </>
        ) : (
          <h3>RC 사생 명단 불러오는 중...</h3>
        )}
      </div>
    </BoardLayout>
  );
};

export default RcStudentsListPage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('/user/count/RC_STUDENT');
  const popoRcStdntCnt = res1.data;

  const res2 = await PoPoAxios.get('/setting/count-rc-students-list');
  const totalRcStdntCnt = res2.data;

  return { props: { popoRcStdntCnt, totalRcStdntCnt } };
}
