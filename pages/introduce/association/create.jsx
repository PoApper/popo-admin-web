import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import IntroduceLayout from '@/components/introduce/introduce.layout';

const AssociationIntroduceCreatePage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [representative, setRepresentative] = useState('');
  const [contact, setContact] = useState('');

  async function handleSubmit() {
    const body = {
      name: name,
      content: content,
      location: location,
      representative: representative,
      contact: contact,
    };

    PoPoAxios.post('introduce/association', body)
      .then(() => {
        alert('소개글을 생성했습니다.');
        router.push('/introduce/association');
      })
      .catch((err) => {
        alert('소개글 생성에 실패했습니다.');
        console.log(err);
      });
  }

  return (
    <IntroduceLayout>
      <h3>자치단체 소개글 생성</h3>

      <Form>
        <Form.Input
          required
          label={'자치단체 이름'}
          onChange={(e) => setName(e.target.value)}
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

        <Message>
          <Message.Header>자치단체 로고</Message.Header>
          <p>
            자치단체 로고는 동아리 생성 후에 설정 할 수 있습니다. 자치단체
            로고가 없으면 기본 이미지가 표시됩니다.
          </p>
        </Message>

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            생성
          </Form.Button>
        </Form.Group>
      </Form>
    </IntroduceLayout>
  );
};

export default AssociationIntroduceCreatePage;
