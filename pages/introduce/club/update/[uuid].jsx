import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import { ClubTypeOptions } from '@/assets/club.type.options';
import IntroduceLayout from '@/components/introduce/introduce.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import ImageUploadForm from '@/components/common/image-upload.form';

const ClubUpdatePage = ({ clubInfo }) => {
  const router = useRouter();
  const localized = useBilingualFields('club', clubInfo);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clubType, setClubType] = useState(clubInfo.clubType);
  const [homepageUrl, setHomepageUrl] = useState(clubInfo.homepageUrl);
  const [facebookUrl, setFacebookUrl] = useState(clubInfo.facebookUrl);
  const [instagramUrl, setInstagramUrl] = useState(clubInfo.instagramUrl);
  const [youtubeUrl, setYoutubeUrl] = useState(clubInfo.youtubeUrl);

  const handleSubmit = async () => {
    if (!localized.validate()) return;
    const body = {
      ...localized.payload(),
      clubType: clubType,
      homepageUrl: homepageUrl,
      facebookUrl: facebookUrl,
      instagramUrl: instagramUrl,
      youtubeUrl: youtubeUrl,
    };

    PoPoAxios.put(`/introduce/club/${clubInfo.uuid}`, body)
      .then(() => {
        alert('동아리 정보를 수정했습니다.');
        router.push('/introduce/club');
      })
      .catch((err) => {
        alert('동아리 정보 수정에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <IntroduceLayout>
      <h3>동아리 정보 수정</h3>

      <Form>
        <BilingualFields form={localized} />

        <Form.Select
          required
          label={'분과'}
          options={ClubTypeOptions}
          value={clubType}
          onChange={(e) => setClubType(e.target.value)}
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
        <Form.Input
          label={'유튜브'}
          placeholder={'https://www.youtube.com/OOOOOO'}
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <ImageUploadForm
          type={'동아리'}
          uploadApiUri={`/introduce/club/image/${clubInfo.uuid}`}
          originalImageUrl={clubInfo.imageUrl}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={localized.values.name}
            deleteURI={`introduce/club/${clubInfo.uuid}`}
            afterDeleteURI={'/introduce/club'}
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

export default ClubUpdatePage;

export async function getServerSideProps(ctx) {
  const { uuid } = ctx['params'];
  const res = await PoPoAxios.get(`introduce/club/${uuid}`);
  const clubInfo = res.data;

  return { props: { clubInfo } };
}
