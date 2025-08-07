import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import IntroduceLayout from '@/components/introduce/introduce.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import ImageUploadForm from '@/components/common/image-upload.form';

const AssociationUpdatePage = ({ associationInfo }) => {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [name, setName] = useState(associationInfo.name);
  const [content, setContent] = useState(associationInfo.content);
  const [location, setLocation] = useState(associationInfo.location);
  const [representative, setRepresentative] = useState(
    associationInfo.representative,
  );
  const [contact, setContact] = useState(associationInfo.contact);
  const [homepageUrl, setHomepageUrl] = useState(associationInfo.homepage_url);
  const [facebookUrl, setFacebookUrl] = useState(associationInfo.facebook_url);
  const [instagramUrl, setInstagramUrl] = useState(
    associationInfo.instagram_url,
  );

  async function handleSubmit() {
    const body = {
      name: name,
      content: content,
      location: location,
      representative: representative,
      contact: contact,
      homepage_url: homepageUrl,
      facebook_url: facebookUrl,
      instagram_url: instagramUrl,
    };

    PoPoAxios.put(`/introduce/association/${associationInfo.uuid}`, body)
      .then(() => {
        alert('자치단체 정보를 수정 했습니다.');
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
        <Form.Group>
          <Form.Input
            required
            label={'자치단체 이름'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>
        <Form.TextArea
          required
          label={'소개글'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Form.Input
          required
          label={'위치'}
          placeholder={'예: 학생회관 OOO호'}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Form.Input
          required
          label={'대표자'}
          placeholder={'홍길동'}
          value={representative}
          onChange={(e) => setRepresentative(e.target.value)}
        />
        <Form.Input
          required
          label={'연락처'}
          placeholder={'OOOOO@postech.ac.kr'}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
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
          originalImageUrl={associationInfo.image_url}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={name}
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
