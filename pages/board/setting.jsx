import { useState } from 'react';
import { Form } from 'semantic-ui-react';

import BoardLayout from '@/components/board/board.layout';
import { PoPoAxios } from '@/utils/axios.instance';

const SettingPage = ({ settingKeyValue }) => {
  const [popoCRMEmail, setPOPOCRMEmail] = useState(
    settingKeyValue.popoCRMEmail,
  );
  const [STUEmail, setSTUEmail] = useState(settingKeyValue.stuEmail);
  const [STUPresidentName, setSTUPresidentName] = useState(
    settingKeyValue.stuPresidentName,
  );
  const [STUPresidentContact, setSTUPresidentContact] = useState(
    settingKeyValue.stuPresidentContact,
  );
  const [STUTel, setSTUTel] = useState(settingKeyValue.stuTel);
  const [STUFax, setSTUFax] = useState(settingKeyValue.stuFax);
  const [dongyeonBank, setDongyeonBank] = useState(
    settingKeyValue.dongyeonBank,
  );
  const [dongyeonServiceTime, setDongyeonServiceTime] = useState(
    settingKeyValue.dongyeonServiceTime,
  );
  const [dongyeonContact, setDongyeonContact] = useState(
    settingKeyValue.dongyeonContact,
  );

  function handleSubmit() {
    PoPoAxios.post('/setting', {
      popoCRMEmail: popoCRMEmail,
      stuEmail: STUEmail,
      stuPresidentName: STUPresidentName,
      stuPresidentContact: STUPresidentContact,
      stuTel: STUTel,
      stuFax: STUFax,
      dongyeonBank: dongyeonBank,
      dongyeonServiceTime: dongyeonServiceTime,
      dongyeonContact: dongyeonContact,
    })
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
        <h4>POPO 설정</h4>
        <Form.Input
          label={'POPO 문의 이메일'}
          value={popoCRMEmail}
          onChange={(e) => setPOPOCRMEmail(e.target.value)}
        />

        <h4>총학생회 설정</h4>
        <Form.Input
          label={'총학생회 이메일'}
          value={STUEmail}
          onChange={(e) => setSTUEmail(e.target.value)}
        />
        <Form.Input
          label={'총학생회장 이름'}
          value={STUPresidentName}
          onChange={(e) => setSTUPresidentName(e.target.value)}
        />
        <Form.Input
          label={'총학생회장 연락처'}
          placeholder={'예: +82-10-xxxx-xxxx'}
          value={STUPresidentContact}
          onChange={(e) => setSTUPresidentContact(e.target.value)}
        />
        <Form.Input
          label={'총학생회 전화번호'}
          placeholder={'예: +82-54-279-2621'}
          value={STUTel}
          onChange={(e) => setSTUTel(e.target.value)}
        />
        <Form.Input
          label={'총학생회 팩스'}
          placeholder={'예: +82-54-279-2626'}
          value={STUFax}
          onChange={(e) => setSTUFax(e.target.value)}
        />

        <h4>동아리 연합회 설정</h4>
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
  const res = await PoPoAxios.get('/setting');
  const settingKeyValue = res.data;

  return { props: { settingKeyValue } };
}
