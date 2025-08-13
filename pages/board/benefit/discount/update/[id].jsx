import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';

const DiscountUpdatePage = ({ discountInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const id = discountInfo.id;
  const [title, setTitle] = useState(discountInfo.title);
  const [region, setRegion] = useState(discountInfo.region);
  const [open_hour, setOpenHour] = useState(discountInfo.open_hour);
  const [phone, setPhone] = useState(discountInfo.phone);
  const [content, setContent] = useState(discountInfo.content);

  const handleSubmit = async () => {
    const body = {
      title: title,
      region: region,
      open_hour: open_hour,
      phone: phone,
      content: content,
    };

    PoPoAxios.put(`/benefit/discount/${id}`, body)
      .then(() => {
        alert('할인 업체 정보가 수정되었습니다!');
        router.push('/board/benefit');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`할인 업체 정보 수정에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>총학 할인 업체 수정</h3>

      <Form>
        <Form.Input
          required
          label={'업체 이름'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Form.Input
          required
          label={'지역'}
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        />

        <Form.Input
          required
          label={'영업 시간'}
          value={open_hour}
          onChange={(e) => setOpenHour(e.target.value)}
        />

        <Form.Input
          required
          label={'가게 변호'}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <Form.TextArea
          required
          label={'설명'}
          value={content}
          style={{ height: 300 }}
          onChange={(e) => setContent(e.target.value)}
        />

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={title}
            deleteURI={`benefit/discount/${id}`}
            afterDeleteURI={'/board/benefit'}
            trigger={
              <Button negative onClick={() => setDeleteModalOpen(true)}>
                <Icon name={'trash'} /> 삭제
              </Button>
            }
          />
        </Form.Group>
      </Form>
    </BoardLayout>
  );
};

export default DiscountUpdatePage;

export async function getServerSideProps(ctx) {
  const { id } = ctx['params'];
  const res = await PoPoAxios.get(`benefit/discount/${id}`);
  const discountInfo = res.data;

  return { props: { discountInfo } };
}
