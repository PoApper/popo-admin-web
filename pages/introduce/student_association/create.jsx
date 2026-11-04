import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import { PoPoAxios } from '@/utils/axios.instance';

const StudentAssociationIntroduceCreatePage = () => {
  const router = useRouter();
  const localized = useBilingualFields('student_association');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = async () => {
    if (!localized.validate()) return;
    const body = {
      ...localized.payload(),
      homepageUrl: homepageUrl,
      facebookUrl: facebookUrl,
      instagramUrl: instagramUrl,
      youtubeUrl: youtubeUrl,
    };

    PoPoAxios.post('/introduce/student_association', body)
      .then(() => {
        alert('소개글을 생성했습니다.');
        router.push('/introduce/student_association');
      })
      .catch((err) => {
        alert('소개글 생성에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <IntroduceLayout>
      <h3>학생단체 소개글 생성</h3>

      <Form>
        <BilingualFields form={localized} />

        <Form.Input
          label={'홈페이지 링크'}
          placeholder={'https://OOOOOOO'}
          onChange={(e) => setHomepageUrl(e.target.value)}
        />
        <Form.Input
          label={'페이스북'}
          placeholder={'https://www.facebook.com/profile.php?id=OOOOOOOO'}
          onChange={(e) => setFacebookUrl(e.target.value)}
        />
        <Form.Input
          label={'인스타그램'}
          placeholder={'https://www.instagram.com/OOOOOO'}
          onChange={(e) => setInstagramUrl(e.target.value)}
        />
        <Form.Input
          label={'유튜브'}
          placeholder={'https://www.youtube.com/OOOOOO'}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />

        <Message>
          <Message.Header>학생단체 로고</Message.Header>
          <p>
            학생단체 로고는 학생단체 생성 후에 설정 할 수 있습니다. 학생단체
            로고가 없으면 기본 이미지가 표시됩니다.
          </p>
        </Message>

        <Form.Button type={'submit'} onClick={handleSubmit}>
          생성
        </Form.Button>
      </Form>
    </IntroduceLayout>
  );
};

export default StudentAssociationIntroduceCreatePage;
