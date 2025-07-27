import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import { RegionOptions } from '@/assets/region.options';
import { PoPoAxios } from '@/utils/axios.instance';
import OpeningHoursEditor, {
  checkValid,
} from '@/components/common/opening_hours.editor';

const PlaceCreatePage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [staff_email, setStaffEmail] = useState('');
  const [max_minutes, setMaxMinutes] = useState(24 * 60);
  const [max_concurrent_reservation, setMaxConcurrentReservation] = useState(1);
  const [opening_hours, setOpeningHours] = useState({
    Everyday: '00:00-24:00',
  });
  const [enable_auto_accept, setEnableAutoAccept] = useState('Inactive');

  const handleSubmit = async () => {
    for (const day of Object.keys(opening_hours)) {
      if (!checkValid(opening_hours[day])) {
        alert(`사용 가능 시간이 올바르지 않습니다: ${day}`);
        return;
      }
    }

    const body = {
      name: name,
      region: region,
      location: location,
      description: description,
      staff_email: staff_email,
      max_minutes: max_minutes,
      max_concurrent_reservation: max_concurrent_reservation,
      opening_hours: JSON.stringify(opening_hours),
      enable_auto_accept: enable_auto_accept,
    };

    PoPoAxios.post('/place', body)
      .then(() => {
        alert('장소가 생성 되었습니다!');
        router.push('/place');
      })
      .catch((err) => {
        console.log(err);
        alert('장소 생성에 실패했습니다.');
      });
  };

  return (
    <ReservationLayout>
      <h3>장소 생성</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Select
            required
            label={'지역'}
            placeholder={'지역을 선택하세요.'}
            options={RegionOptions}
            onChange={(e, { value }) => setRegion(value)}
          />
          <Form.Input
            required
            label={'장소 이름'}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Input
          required
          label={'위치'}
          placeholder={'예: 학생회관 304호'}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Form.Input
          label={'최대 예약가능 시간'}
          placeholder={
            '해당 장소를 예약가능한 최대 시간을 분단위로 입력해주세요 (ex. 60)'
          }
          onChange={(e) => setMaxMinutes(e.target.value)}
        />
        <p>
          최대 예약가능 시간이 넘는 예약이 생성되지 않도록 합니다. (단위:
          minutes)
        </p>

        <Form.Input
          label={'최대 동시 예약 갯수'}
          placeholder={
            '해당 장소를 동시 예약 가능한 최대 갯수를 입력해주세요 (ex. 1)'
          }
          onChange={(e) => setMaxConcurrentReservation(e.target.value)}
        />

        <OpeningHoursEditor
          currentOpeningHour={{ Everyday: '00:00-24:00' }}
          openingHour={opening_hours}
          setOpeningHours={setOpeningHours}
        />

        <Form.Select
          required
          toggle
          label={'자동 승인 기능 활성화'}
          value={enable_auto_accept}
          options={[
            { key: 'active', text: '활성', value: 'Active' },
            { key: 'inactive', text: '비활성', value: 'Inactive' },
          ]}
          onChange={(e, { value }) => setEnableAutoAccept(value)}
        />

        <Form.TextArea
          required
          label={'설명'}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Form.Input
          label={'담당자 이메일'}
          placeholder="장소 예약을 처리할 담당자의 이메일을 작성해주세요"
          onChange={(e) => setStaffEmail(e.target.value)}
        />
        <p>장소 예약이 생성되면, 담당자 메일로 예약 생성 메일이 갑니다.</p>

        <Message>
          <Message.Header>장소 이미지</Message.Header>
          <p>
            장소 이미지는 장소 생성 후에 설정 할 수 있습니다. 장소의 이미지가
            없으면 기본 이미지가 표시됩니다.
          </p>
        </Message>

        <Form.Button type={'submit'}>생성</Form.Button>
      </Form>
    </ReservationLayout>
  );
};

export default PlaceCreatePage;
