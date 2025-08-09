import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Form, Icon } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';

const AffiliateUpdatePage = ({ affiliateInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const id = affiliateInfo.id;
  const [title, setTitle] = useState(affiliateInfo.title);
  const [content_short, setContentShort] = useState(
    affiliateInfo.content_short,
  );
  const [content, setContent] = useState(affiliateInfo.content);

  const handleSubmit = async () => {
    const body = {
      title: title,
      content_short: content_short,
      content: content,
    };

    PoPoAxios.put(`/benefit/affiliate/${id}`, body)
      .then(() => {
        alert('제휴 업체 정보가 수정되었습니다!');
        router.push('/board/benefit');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`제휴 업체 정보 수정에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>총학 제휴 업체 수정</h3>

      <Form>
        <Form.Input
          required
          label={'업체 이름'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Form.TextArea
          required
          label={'짧은 설명'}
          value={content_short}
          onChange={(e) => setContentShort(e.target.value)}
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
            deleteURI={`benefit/affiliate/${id}`}
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

export default AffiliateUpdatePage;

export async function getServerSideProps(ctx) {
  const { id } = ctx['params'];
  const res = await PoPoAxios.get(`benefit/affiliate/${id}`);
  const affiliateInfo = res.data;

  return { props: { affiliateInfo } };
}
