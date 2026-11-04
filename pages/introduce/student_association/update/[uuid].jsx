import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import ImageUploadForm from '@/components/common/image-upload.form';
import { PoPoAxios } from '@/utils/axios.instance';

const StudentAssociationUpdatePage = ({ studentAssociationInfo }) => {
  const router = useRouter();
  const localized = useBilingualFields(
    'student_association',
    studentAssociationInfo,
  );

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [homepageUrl, setHomepageUrl] = useState(
    studentAssociationInfo.homepageUrl ?? '',
  );
  const [facebookUrl, setFacebookUrl] = useState(
    studentAssociationInfo.facebookUrl ?? '',
  );
  const [instagramUrl, setInstagramUrl] = useState(
    studentAssociationInfo.instagramUrl ?? '',
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    studentAssociationInfo.youtubeUrl ?? '',
  );

  const handleSubmit = async () => {
    if (!localized.validate()) return;
    const body = {
      ...localized.payload(),
      homepageUrl: homepageUrl,
      facebookUrl: facebookUrl,
      instagramUrl: instagramUrl,
      youtubeUrl: youtubeUrl,
    };

    PoPoAxios.put(
      `/introduce/student_association/${studentAssociationInfo.uuid}`,
      body,
    )
      .then(() => {
        alert('학생단체 정보를 수정했습니다.');
        router.push('/introduce/student_association');
      })
      .catch((err) => {
        alert('학생단체 정보 수정에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <IntroduceLayout>
      <h3>학생단체 정보 수정</h3>

      <Form>
        <BilingualFields form={localized} />

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
        <Form.Input
          label={'유튜브'}
          placeholder={'https://www.youtube.com/OOOOOO'}
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <ImageUploadForm
          type={'학생단체'}
          uploadApiUri={`introduce/student_association/image/${studentAssociationInfo.uuid}`}
          originalImageUrl={studentAssociationInfo.imageUrl}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={localized.values.name}
            deleteURI={`introduce/student_association/${studentAssociationInfo.uuid}`}
            afterDeleteURI={'/introduce/student_association'}
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

export default StudentAssociationUpdatePage;

export async function getServerSideProps(ctx) {
  const { uuid } = ctx['params'];
  const res = await PoPoAxios.get(`introduce/student_association/${uuid}`);
  const studentAssociationInfo = res.data;

  return { props: { studentAssociationInfo } };
}
