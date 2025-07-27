import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import OpeningHoursEditor, {
  checkValid,
} from '@/components/common/opening_hours.editor';
import { PoPoAxios } from '@/utils/axios.instance';
import { RegionOptions } from '@/assets/region.options';
import ImageUploadForm from '@/components/common/image-upload.form';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';

const PlaceUpdatePage = ({ placeInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [name, setName] = useState(placeInfo.name);
  const [region, setRegion] = useState(placeInfo.region);
  const [location, setLocation] = useState(placeInfo.location);
  const [description, setDescription] = useState(placeInfo.description);
  const [staff_email, setStaffEmail] = useState(placeInfo.staff_email);
  const [max_minutes, setMaxMinutes] = useState(placeInfo.max_minutes);
  const [max_concurrent_reservation, setMaxConcurrentReservation] = useState(
    placeInfo.max_concurrent_reservation,
  );
  const [opening_hours, setOpeningHours] = useState(
    JSON.parse(placeInfo.opening_hours),
  );
  const [enable_auto_accept, setEnableAutoAccept] = useState(
    placeInfo.enable_auto_accept,
  );

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

    PoPoAxios.put(`/place/${placeInfo.uuid}`, body)
      .then(() => {
        alert('장소 정보가 수정 되었습니다!');
        router.push('/place');
      })
      .catch((err) => {
        alert('장소 정보 수정에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <ReservationLayout>
      <h3>장소 수정</h3>

      <Form>
        <Form.Group>
          <Form.Select
            required
            label={'지역'}
            placeholder={'지역을 선택하세요.'}
            value={region}
            options={RegionOptions}
            onChange={(e, { value }) => setRegion(value)}
          />
          <Form.Input
            required
            label={'장소 이름'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.Input
          required
          label={'위치'}
          placeholder={'예: 학생회관 304호'}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <Form.Input
          label={'최대 예약가능 기간(단위: 분)'}
          placeholder={
            '해당 장소를 예약가능한 최대 시간을 분단위로 입력해주세요 (ex. 60)'
          }
          value={max_minutes}
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
          value={max_concurrent_reservation}
          onChange={(e) => setMaxConcurrentReservation(e.target.value)}
        />

        <OpeningHoursEditor
          currentOpeningHour={JSON.parse(placeInfo.opening_hours)}
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Form.Input
          label={'담당자 이메일'}
          placeholder="장소 예약을 처리할 담당자의 이메일을 작성해주세요"
          value={staff_email}
          onChange={(e) => setStaffEmail(e.target.value)}
        />
        <p>장소 예약이 생성되면, 담당자 메일로 예약 생성 메일이 갑니다.</p>

        <ImageUploadForm
          type={'장소'}
          uploadApiUri={`place/image/${placeInfo.uuid}`}
          originalImageUrl={placeInfo.image_url}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={name}
            deleteURI={`place/${placeInfo.uuid}`}
            afterDeleteURI={'/place'}
            trigger={
              <Button negative onClick={() => setDeleteModalOpen(true)}>
                <Icon name={'trash'} /> 삭제
              </Button>
            }
          />
        </Form.Group>
      </Form>
    </ReservationLayout>
  );
};

export default PlaceUpdatePage;

export async function getServerSideProps(ctx) {
  const { uuid } = ctx['params'];
  const res = await PoPoAxios.get(`place/${uuid}`);
  const placeInfo = res.data;

  return { props: { placeInfo } };
}
