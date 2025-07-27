import { useState } from 'react';
import { useRouter } from 'next/router';
import { Form } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';

const DiscountCreatePage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [region, setRegion] = useState('');
  const [open_hour, setOpenHour] = useState('');
  const [phone, setPhone] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async () => {
    const body = {
      title: title,
      region: region,
      open_hour: open_hour,
      phone: phone,
      content: content,
    };

    PoPoAxios.post('/benefit/discount', body)
      .then(() => {
        alert('할인 업체가 등록 되었습니다!');
        router.push('/board/benefit');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`할인 업체 등록에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>총학 할인 업체 생성</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Input
          required
          label={'업체 이름'}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Form.Input
          required
          label={'지역'}
          onChange={(e) => setRegion(e.target.value)}
        />

        <Form.Input
          required
          label={'영업 시간'}
          onChange={(e) => setOpenHour(e.target.value)}
        />

        <Form.Input
          required
          label={'가게 변호'}
          onChange={(e) => setPhone(e.target.value)}
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

export default DiscountCreatePage;
