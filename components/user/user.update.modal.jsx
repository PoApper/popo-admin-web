import { Button, Form, Modal } from 'semantic-ui-react';
import { useState } from 'react';
import DeleteConfirmModal from '../common/delete.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';

export const userTypeOptions = [
  { key: 'STUDENT', text: '학생', value: 'STUDENT' },
  { key: 'RC_STUDENT', text: 'RC 학부생', value: 'RC_STUDENT' },
  { key: 'FACULTY', text: '교직원', value: 'FACULTY' },
  { key: 'CLUB', text: '동아리', value: 'CLUB' },
  { key: 'ASSOCIATION', text: '학생단체', value: 'ASSOCIATION' },
  { key: 'ADMIN', text: '관리자', value: 'ADMIN' },
  { key: 'STAFF', text: 'Staff', value: 'STAFF' },
  { key: 'OTHERS', text: 'OTHERS', value: 'OTHERS' },
];

const userStatusOptions = [
  { key: 'ACTIVATED', text: 'ACTIVATED', value: 'ACTIVATED' },
  { key: 'DEACTIVATED', text: 'DEACTIVATED', value: 'DEACTIVATED' },
  { key: 'BANNED', text: 'BANNED', value: 'BANNED' },
];

const UserUpdateModal = ({ user, trigger }) => {
  const [open, setOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [email, setEmail] = useState(user.email);
  const [name, setName] = useState(user.name);
  const [userType, setUserType] = useState(user.userType);
  const [userStatus, setUserStatus] = useState(user.userStatus);

  const handleSubmit = async () => {
    try {
      await PoPoAxios.put(`/user/${user.uuid}`, {
        email: email,
        name: name,
        userType: userType,
        userStatus: userStatus,
      });
      window.location.reload();
    } catch (err) {
      alert('유저 정보 수정에 실패했습니다.');
      console.log(err);
    }
  };

  return (
    <Modal
      closeIcon
      size="small"
      open={open}
      trigger={trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>유저 정보 수정</Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Input
            required
            label={'email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Input
            required
            label={'이름'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Select
            required
            label={'유저 타입'}
            placeholder="유저 타입을 선택하세요."
            value={userType}
            options={userTypeOptions}
            onChange={(e, { value }) => setUserType(value)}
          />
          <Form.Select
            required
            label={'유저 상태'}
            placeholder="유저 상태를 선택하세요."
            value={userStatus}
            options={userStatusOptions}
            onChange={(e, { value }) => setUserStatus(value)}
          />
          <Modal.Actions>
            <Form.Group>
              <Form.Button type="submit" onClick={handleSubmit}>
                수정
              </Form.Button>
              <DeleteConfirmModal
                open={deleteModalOpen}
                target={`${name}(${email})`}
                deleteURI={`user/${user.uuid}`}
                trigger={
                  <Button negative onClick={() => setDeleteModalOpen(true)}>
                    삭제
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

export default UserUpdateModal;
