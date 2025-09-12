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
  const [staffEmail, setStaffEmail] = useState(placeInfo.staffEmail);
  const [maxMinutes, setMaxMinutes] = useState(placeInfo.maxMinutes);
  const [maxConcurrentReservation, setMaxConcurrentReservation] = useState(
    placeInfo.maxConcurrentReservation,
  );
  const [openingHours, setOpeningHours] = useState(
    JSON.parse(placeInfo.openingHours),
  );
  const [enableAutoAccept, setEnableAutoAccept] = useState(
    placeInfo.enableAutoAccept,
  );

  const handleSubmit = async () => {
    for (const day of Object.keys(openingHours)) {
      if (!checkValid(openingHours[day])) {
        alert(`사용 가능 시간이 올바르지 않습니다: ${day}`);
        return;
      }
    }

    const body = {
      name: name,
      region: region,
      location: location,
      description: description,
      staffEmail: staffEmail,
      maxMinutes: maxMinutes,
      maxConcurrentReservation: maxConcurrentReservation,
      openingHours: JSON.stringify(openingHours),
      enableAutoAccept: enableAutoAccept,
    };

    PoPoAxios.put(`/place/${placeInfo.uuid}`, body)
      .then(() => {
        alert('장소 정보가 수정되었습니다!');
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
          value={maxMinutes}
          onChange={(e) => setMaxMinutes(e.target.value)}
        />
        <p>
          최대 예약가능 시간이 넘는 예약이 생성되지 않도록 합니다. (단위:
          minutes)
        </p>

        <Form.Input
          label={'최대 동시 예약 개수'}
          placeholder={
            '해당 장소를 동시 예약 가능한 최대 개수를 입력해주세요 (ex. 1)'
          }
          value={maxConcurrentReservation}
          onChange={(e) => setMaxConcurrentReservation(e.target.value)}
        />

        <OpeningHoursEditor
          currentOpeningHour={JSON.parse(placeInfo.openingHours)}
          openingHour={openingHours}
          setOpeningHours={setOpeningHours}
        />

        <Form.Select
          required
          toggle
          label={'자동 승인 기능 활성화'}
          value={enableAutoAccept}
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
          value={staffEmail}
          onChange={(e) => setStaffEmail(e.target.value)}
        />
        <p>장소 예약이 생성되면, 담당자 메일로 예약 생성 메일이 갑니다.</p>

        <ImageUploadForm
          type={'장소'}
          uploadApiUri={`place/image/${placeInfo.uuid}`}
          originalImageUrl={placeInfo.imageUrl}
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
