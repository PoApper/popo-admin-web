import { Form, Modal } from 'semantic-ui-react';
import { useState } from 'react';
import { PoPoAxios } from '@/utils/axios.instance';

const WhitebookCreateModal = (props) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [content, setContent] = useState('');
  const [showOnlyLogin, setShowOnlyLogin] = useState(false);

  const handleSubmit = async () => {
    try {
      await PoPoAxios.post(
        '/whitebook',
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
      alert('생활백서 생성에 실패했습니다.');
      console.log(e);
    }
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={props.trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>생활백서 생성</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'생활백서 제목'}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Form.Input
            required
            label={'생활백서 링크'}
            placeholder={'https://xxxx.postech.ac.kr'}
            onChange={(e) => setLink(e.target.value)}
          />
          <Form.TextArea
            required
            label={'생활백서 설명글'}
            onChange={(e) => setContent(e.target.value)}
          />
          <Form.Checkbox
            required
            label={'로그인 유저에게만 보이기'}
            value={showOnlyLogin}
            onChange={() => setShowOnlyLogin(!showOnlyLogin)}
          />

          <Modal.Actions>
            <Form.Button type={'submit'} onClick={handleSubmit}>
              생성
            </Form.Button>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default WhitebookCreateModal;
