import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';

const AffiliateCreatePage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [contentShort, setContentShort] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const body = {
      title: title,
      contentShort: contentShort,
      content: content,
    };

    PoPoAxios.post('/benefit/affiliate', body)
      .then(() => {
        alert('제휴 업체가 등록되었습니다!');
        router.push('/board/benefit');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`제휴 업체 등록에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>총학 제휴 업체 생성</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Input
          required
          label={'업체 이름'}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Form.TextArea
          required
          label={'짧은 설명'}
          onChange={(e) => setContentShort(e.target.value)}
        />

        <Form.TextArea
          required
          label={'설명'}
          style={{ height: 300 }}
          onChange={(e) => setContent(e.target.value)}
        />

        <Form.Button type={'submit'}>생성</Form.Button>
      </Form>
    </BoardLayout>
  );
};

export default AffiliateCreatePage;
