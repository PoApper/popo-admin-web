import { Button, Form, Icon, Modal } from 'semantic-ui-react';
import { useState } from 'react';
import DeleteConfirmModal from '../../common/delete.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';

const WhitebookUpdateModal = ({ trigger, whitebook }) => {
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [title, setTitle] = useState(whitebook.title);
  const [link, setLink] = useState(whitebook.link);
  const [content, setContent] = useState(whitebook.content);
  const [showOnlyLogin, setShowOnlyLogin] = useState(whitebook.show_only_login);

  const handleSubmit = async () => {
    try {
      await PoPoAxios.put(
        `/whitebook/${whitebook.uuid}`,
        {
          title: title,
          link: link,
          content: content,
          show_only_login: showOnlyLogin,
        },
        { withCredentials: true },
      );
      setOpen(false);
      window.location.reload();
    } catch (e) {
      alert('생활백서 수정에 실패했습니다.');
      console.log(e);
    }
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>생활백서 수정</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'생활백서 제목'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Form.Input
            required
            label={'생활백서 링크'}
            value={link}
            placeholder={'https://xxxx.postech.ac.kr'}
            onChange={(e) => setLink(e.target.value)}
          />
          <Form.TextArea
            required
            label={'생활백서 설명글'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Form.Checkbox
            required
            label={'로그인 유저에게만 보이기'}
            value={showOnlyLogin}
            onChange={() => setShowOnlyLogin(!showOnlyLogin)}
          />

          <Modal.Actions>
            <Form.Group>
              <Form.Button type={'submit'} onClick={handleSubmit}>
                수정
              </Form.Button>
              <DeleteConfirmModal
                open={deleteModalOpen}
                target={name}
                deleteURI={`whitebook/${whitebook.uuid}`}
                trigger={
                  <Button negative onClick={() => setDeleteModalOpen(true)}>
                    <Icon name={'trash'} /> 삭제
                  </Button>
                }
              />
            </Form.Group>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default WhitebookUpdateModal;
