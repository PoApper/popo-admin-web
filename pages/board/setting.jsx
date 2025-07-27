import { useState } from 'react';
import { Form } from 'semantic-ui-react';

import BoardLayout from '@/components/board/board.layout';
import { PoPoAxios } from '@/utils/axios.instance';

const SettingPage = ({ settingKeyValue }) => {
  const [popoCRMEmail, setPOPOCRMEmail] = useState(
    settingKeyValue.popo_crm_email,
  );
  const [STUEmail, setSTUEmail] = useState(settingKeyValue.stu_email);
  const [dongyeonBank, setDongyeonBank] = useState(
    settingKeyValue.dongyeon_bank,
  );
  const [dongyeonServiceTime, setDongyeonServiceTime] = useState(
    settingKeyValue.dongyeon_service_time,
  );
  const [dongyeonContact, setDongyeonContact] = useState(
    settingKeyValue.dongyeon_contact,
  );

  function handleSubmit() {
    PoPoAxios.post(
      '/setting',
      {
        popo_crm_email: popoCRMEmail,
        stu_email: STUEmail,
        dongyeon_bank: dongyeonBank,
        dongyeon_service_time: dongyeonServiceTime,
        dongyeon_contact: dongyeonContact,
      },
      { withCredentials: true },
    )
      .then(() => alert('설정값을 저장했습니다!'))
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`설정값을 저장하는데 실패했습니다.\n${errMsg}`);
      });
  }

  return (
    <BoardLayout>
      <h3>POPO 설정값</h3>
      <p>
        이곳에서 동적으로 변경할 수 있는 POPO 설정값을 채울 수 있습니다. 추가를
        원하는게 설정값이 있으면 POPO 개발팀으로 문의 부탁드립니다.
      </p>

      <Form>
        <Form.Input
          label={'POPO 문의 이메일'}
          value={popoCRMEmail}
          onChange={(e) => setPOPOCRMEmail(e.target.value)}
        />
        <Form.Input
          label={'학생회 이메일'}
          value={STUEmail}
          onChange={(e) => setSTUEmail(e.target.value)}
        />
        <Form.Input
          label={'동아리 연합회 계좌 (장비 예약비)'}
          value={dongyeonBank}
          onChange={(e) => setDongyeonBank(e.target.value)}
        />
        <Form.Input
          label={'동아리 연합회 대여시간'}
          value={dongyeonServiceTime}
          onChange={(e) => setDongyeonServiceTime(e.target.value)}
        />
        <Form.Input
          label={'동아리 연합회 문의 번호'}
          value={dongyeonContact}
          onChange={(e) => setDongyeonContact(e.target.value)}
        />

        <Form.Button primary type={'submit'} onClick={handleSubmit}>
          저장
        </Form.Button>
      </Form>
    </BoardLayout>
  );
};

export default SettingPage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('/setting'); // 현재는 설정값 조회가 Public API 이므로 withCredentials 옵션 필요 없음
  const settingKeyValue = res.data;

  return { props: { settingKeyValue } };
}
