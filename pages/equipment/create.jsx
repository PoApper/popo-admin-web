import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import { OwnerOptions } from '@/assets/owner.options';
import OpeningHoursEditor, {
  checkValid,
} from '@/components/common/opening_hours.editor';

const EquipmentCreatePage = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [equipOwner, setEquipOwner] = useState('');
  const [fee, setFee] = useState('');
  const [description, setDescription] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [maxMinutes, setMaxMinutes] = useState();
  const [openingHours, setOpeningHours] = useState({ Everyday: '00:00-24:00' });

  const handleSubmit = async () => {
    for (const day of Object.keys(openingHours)) {
      if (!checkValid(openingHours[day])) {
        alert(`사용 가능 시간이 올바르지 않습니다: ${day}`);
        return;
      }
    }

    const body = {
      name: name,
      equipOwner: equipOwner,
      fee: fee,
      description: description,
      staffEmail: staffEmail,
      openingHours: JSON.stringify(openingHours),
    };

    if (maxMinutes) {
      body['maxMinutes'] = maxMinutes;
    }

    PoPoAxios.post('/equip', body)
      .then(() => {
        alert('장비가 생성되었습니다!');
        router.push('/equipment');
      })
      .catch((err) => {
        alert('장비 생성에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <ReservationLayout>
      <h3>장비 생성</h3>
      <Form>
        <Form.Group>
          <Form.Input
            required
            label={'장비 이름'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Select
            required
            label={'장비 소속'}
            value={equipOwner}
            options={OwnerOptions}
            onChange={(e, { value }) => setEquipOwner(value)}
          />
        </Form.Group>

        <Form.Input
          required
          label={'예약 비용'}
          value={fee}
          onChange={(e) => setFee(e.target.value)}
        />

        <Form.Input
          label={'최대 예약가능 시간'}
          placeholder={
            '해당 장비를 예약가능한 최대 시간을 분단위로 입력해주세요 (ex. 60)'
          }
          onChange={(e) => setMaxMinutes(e.target.value)}
        />
        <p>최대 예약가능 시간이 넘는 예약이 생성되지 않도록 합니다.</p>

        <OpeningHoursEditor
          currentOpeningHour={{ Everyday: '00:00-24:00' }}
          openingHour={openingHours}
          setOpeningHours={setOpeningHours}
        />

        <Form.TextArea
          required
          label={'설명'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Form.Input
          label={'담당자 이메일'}
          placeholder="장비 예약을 처리할 담당자의 이메일을 작성해주세요"
          value={staffEmail}
          onChange={(e) => setStaffEmail(e.target.value)}
        />
        <p>장비 예약이 생성되면, 담당자 메일로 예약 생성 메일이 갑니다.</p>

        <Message>
          <Message.Header>장비 이미지</Message.Header>
          <p>
            장비 이미지는 장비 생성 후에 설정 할 수 있습니다. 장비의 이미지가
            없으면 기본 이미지가 표시됩니다.
          </p>
        </Message>

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            생성
          </Form.Button>
        </Form.Group>
      </Form>
    </ReservationLayout>
  );
};

export default EquipmentCreatePage;
