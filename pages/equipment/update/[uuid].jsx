import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import { OwnerOptions } from '@/assets/owner.options';
import ReservationLayout from '@/components/reservation/reservation.layout';
import ImageUploadForm from '@/components/common/image-upload.form';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';

const EquipmentUpdatePage = ({ equipmentInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [name, setName] = useState(equipmentInfo.name);
  const [equip_owner, setEquipOwner] = useState(equipmentInfo.equip_owner);
  const [fee, setFee] = useState(equipmentInfo.fee);
  const [description, setDescription] = useState(equipmentInfo.description);
  const [staff_email, setStaffEmail] = useState(equipmentInfo.staff_email);
  const [max_minutes, setMaxMinutes] = useState(equipmentInfo.max_minutes);

  const handleSubmit = async () => {
    const body = {
      name: name,
      equip_owner: equip_owner,
      fee: fee,
      description: description,
      staff_email: staff_email,
    };

    if (max_minutes) {
      body['max_minutes'] = max_minutes;
    }

    PoPoAxios.put(`/equip/${equipmentInfo.uuid}`, body)
      .then(() => {
        alert('장비 정보가 수정 되었습니다!');
        router.push('/equipment');
      })
      .catch((err) => {
        alert('장비 정보 수정에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <ReservationLayout>
      <h3>장비 수정</h3>
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
            value={equip_owner}
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
          label={'최대 예약가능 기간(단위: 분)'}
          placeholder={
            '해당 장비를 예약가능한 최대 시간을 분단위로 입력해주세요 (ex. 60)'
          }
          value={max_minutes}
          onChange={(e) => setMaxMinutes(e.target.value)}
        />
        <p>최대 예약가능 시간이 넘는 예약이 생성되지 않도록 합니다.</p>
        <Form.TextArea
          required
          label={'설명'}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Form.Input
          label={'담당자 이메일'}
          placeholder="장비 예약을 처리할 담당자의 이메일을 작성해주세요"
          value={staff_email}
          onChange={(e) => setStaffEmail(e.target.value)}
        />
        <p>장비 예약이 생성되면, 담당자 메일로 예약 생성 메일이 갑니다.</p>

        <ImageUploadForm
          type={'장비'}
          uploadApiUri={`equip/image/${equipmentInfo.uuid}`}
          originalImageUrl={equipmentInfo.image_url}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={name}
            deleteURI={`equip/${equipmentInfo.uuid}`}
            afterDeleteURI={'/equipment'}
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

export default EquipmentUpdatePage;

export async function getServerSideProps(ctx) {
  const { uuid } = ctx['params'];
  const res = await PoPoAxios.get(`equip/${uuid}`);
  const equipmentInfo = res.data;

  return { props: { equipmentInfo } };
}
