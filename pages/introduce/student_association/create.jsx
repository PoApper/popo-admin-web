import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import { PoPoAxios } from '@/utils/axios.instance';

const StudentAssociationIntroduceCreatePage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [office, setOffice] = useState('');
  const [representative, setRepresentative] = useState('');
  const [contact, setContact] = useState('');
  const [homepageUrl, setHomepageUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const handleSubmit = async () => {
    const body = {
      name: name,
      shortDesc: shortDesc,
      content: content,
      location: location,
      office: office,
      representative: representative,
      contact: contact,
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
        <Form.Input
          required
          label={'학생단체 이름'}
          onChange={(e) => setName(e.target.value)}
        />
        <Form.Input
          required
          label={'짧은 설명'}
          placeholder={'예: 상담, 인권, 국제교류'}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        <Form.TextArea
          required
          label={'소개글'}
          onChange={(e) => setContent(e.target.value)}
        />
        <Form.Input
          required
          label={'위치'}
          placeholder={'예: 학생회관 OOO호'}
          onChange={(e) => setLocation(e.target.value)}
        />
        <Form.Input
          required
          label={'협력 행정팀'}
          placeholder={'예: 학생지원팀'}
          onChange={(e) => setOffice(e.target.value)}
        />
        <Form.Input
          required
          label={'대표자'}
          placeholder={'홍길동'}
          onChange={(e) => setRepresentative(e.target.value)}
        />
        <Form.Input
          required
          label={'연락처'}
          placeholder={'OOOOO@postech.ac.kr'}
          onChange={(e) => setContact(e.target.value)}
        />
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
