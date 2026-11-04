import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import IntroduceLayout from '@/components/introduce/introduce.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import ImageUploadForm from '@/components/common/image-upload.form';
import {
  AssociationTypeOptions,
  getAssociationTypeValue,
} from '@/assets/association.type.options';

const AssociationUpdatePage = ({ associationInfo }) => {
  const router = useRouter();
  const localized = useBilingualFields('association', associationInfo);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [associationType, setAssociationType] = useState(
    getAssociationTypeValue(associationInfo.associationType),
  );
  const [homepageUrl, setHomepageUrl] = useState(associationInfo.homepageUrl);
  const [facebookUrl, setFacebookUrl] = useState(associationInfo.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(
    associationInfo.instagramUrl,
  );

  async function handleSubmit() {
    if (!localized.validate()) return;
    if (!associationType) {
      alert('자치단체 분류를 선택해주세요.');
      return;
    }

    const body = {
      ...localized.payload(),
      associationType: associationType,
      homepageUrl: homepageUrl,
      facebookUrl: facebookUrl,
      instagramUrl: instagramUrl,
    };

    PoPoAxios.put(`/introduce/association/${associationInfo.uuid}`, body)
      .then(() => {
        alert('자치단체 정보를 수정했습니다.');
        router.push('/introduce/association');
      })
      .catch((err) => {
        alert('자치단체 정보 수정에 실패했습니다.');
        console.log(err);
      });
  }

  return (
    <IntroduceLayout>
      <h3>자치단체 소개글 수정</h3>
      <Form>
        <BilingualFields form={localized} />

        <Form.Select
          required
          label={'자치단체 분류'}
          options={AssociationTypeOptions}
          placeholder={'자치단체 분류를 선택하세요.'}
          value={associationType}
          onChange={(e, { value }) => setAssociationType(value)}
        />

        <Form.Input
          label={'홈페이지 링크'}
          placeholder={'https://OOOOOOO'}
          value={homepageUrl}
          onChange={(e) => setHomepageUrl(e.target.value)}
        />
        <Form.Input
          label={'페이스북'}
          placeholder={'https://www.facebook.com/profile.php?id=OOOOOOOO'}
          value={facebookUrl}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
        <Form.Input
          label={'인스타그램'}
          placeholder={'https://www.instagram.com/OOOOOO'}
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />

        <ImageUploadForm
          type={'자치단체'}
          uploadApiUri={`introduce/association/image/${associationInfo.uuid}`}
          originalImageUrl={associationInfo.imageUrl}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={localized.values.name}
            deleteURI={`introduce/association/${associationInfo.uuid}`}
            afterDeleteURI={'/introduce/association'}
            trigger={
              <Button negative onClick={() => setDeleteModalOpen(true)}>
                <Icon name={'trash'} /> 삭제
              </Button>
            }
          />
        </Form.Group>
      </Form>
    </IntroduceLayout>
  );
};

export default AssociationUpdatePage;

export async function getServerSideProps(ctx) {
  const { uuid } = ctx['params'];
  const res = await PoPoAxios.get(`introduce/association/${uuid}`);
  const associationInfo = res.data;

  return { props: { associationInfo } };
}
