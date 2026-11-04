import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import { ClubTypeOptions } from '@/assets/club.type.options';

const ClubIntroduceCreatePage = () => {
  const router = useRouter();
  const localized = useBilingualFields('club');
  const [clubType, setClubType] = useState('');

  const handleSubmit = async () => {
    if (!localized.validate()) return;
    const body = {
      ...localized.payload(),
      clubType: clubType,
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
        <BilingualFields form={localized} />

        <Form.Select
          required
          label={'분과'}
          options={ClubTypeOptions}
          onChange={(e, { value }) => setClubType(value)}
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
