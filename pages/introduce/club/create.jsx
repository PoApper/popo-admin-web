import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import { ClubTypeOptions } from '@/assets/club.type.options';

const ClubIntroduceCreatePage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [shortDesc, setShortDesc] = useState('');
  const [clubType, setClubType] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [representative, setRepresentative] = useState('');
  const [contact, setContact] = useState('');

  const handleSubmit = async () => {
    const body = {
      name: name,
      shortDesc: shortDesc,
      clubType: clubType,
      content: content,
      location: location,
      representative: representative,
      contact: contact,
    };

    PoPoAxios.post('/introduce/club', body)
      .then(() => {
        alert('소개글을 생성했습니다.');
        router.push('/introduce/club');
      })
      .catch((err) => {
        alert('소개글 생성에 실패했습니다.');
        console.log(err);
      });
  };

  return (
    <IntroduceLayout>
      <h3>동아리 소개글 생성</h3>

      <Form>
        <Form.Input
          required
          label={'동아리 이름'}
          onChange={(e) => setName(e.target.value)}
        />
        <Form.Input
          required
          label={'짧은 설명'}
          placeholder={'예: 개발, 축구, 재즈'}
          onChange={(e) => setShortDesc(e.target.value)}
        />
        <Form.Select
          required
          label={'분과'}
          options={ClubTypeOptions}
          onChange={(e, { value }) => setClubType(value)}
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
          label={'대표자'}
          placeholder={'홍길동'}
          onChange={(e) => setRepresentative(e.target.value)}
        />
        <Form.Input
          label={'연락처'}
          placeholder={'OOOOO@postech.ac.kr'}
          onChange={(e) => setContact(e.target.value)}
        />

        <Message>
          <Message.Header>동아리 로고</Message.Header>
          <p>
            동아리 로고는 동아리 생성 후에 설정 할 수 있습니다. 동아리 로고가
            없으면 기본 이미지가 표시됩니다.
          </p>
        </Message>

        <Form.Button type={'submit'} onClick={handleSubmit}>
          생성
        </Form.Button>
      </Form>
    </IntroduceLayout>
  );
};

export default ClubIntroduceCreatePage;
