import { useState } from 'react';
import { Button, Modal } from 'semantic-ui-react';
import { useRouter } from 'next/router';

import { PoPoAxios } from '@/utils/axios.instance';

const DeleteConfirmModal = (props) => {
  const router = useRouter();

  const deleteTarget = props.target;
  const deleteURI = props.deleteURI;
  const afterDeleteURI = props.afterDeleteURI;
  const [open, setOpen] = useState(props.open);

  const handleDelete = async () => {
    try {
      await PoPoAxios.delete(`/${deleteURI}`);
      if (afterDeleteURI) {
        router.push(afterDeleteURI);
      } else {
        window.location.reload();
      }
    } catch (err) {
      const errMsg = err.response.data.message;
      alert(`삭제에 실패했습니다.\n${errMsg}`);
    }
  };

  return (
    <Modal
      open={open}
      trigger={props.trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>삭제 확인</Modal.Header>
      <Modal.Content>
        <b>{deleteTarget}</b>이 삭제 됩니다. 정말 삭제 하시겠습니까?
      </Modal.Content>
      <Modal.Actions>
        <Button content="취소" onClick={() => setOpen(false)} />
        <Button negative icon="check" content="삭제" onClick={handleDelete} />
      </Modal.Actions>
    </Modal>
  );
};

export default DeleteConfirmModal;
