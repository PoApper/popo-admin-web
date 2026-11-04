import BilingualFields, {
  useBilingualFields,
} from '@/components/common/bilingual.fields';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Form, Message } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import IntroduceLayout from '@/components/introduce/introduce.layout';
import { AssociationTypeOptions } from '@/assets/association.type.options';

const AssociationIntroduceCreatePage = () => {
  const router = useRouter();
  const localized = useBilingualFields('association');
  const [associationType, setAssociationType] = useState('');

  async function handleSubmit() {
    if (!localized.validate()) return;
    if (!associationType) {
      alert('자치단체 분류를 선택해주세요.');
      return;
    }

    const body = {
      ...localized.payload(),
      associationType: associationType,
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
        <BilingualFields form={localized} />

        <Form.Select
          required
          label={'자치단체 분류'}
          options={AssociationTypeOptions}
          placeholder={'자치단체 분류를 선택하세요.'}
          onChange={(e, { value }) => setAssociationType(value)}
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
