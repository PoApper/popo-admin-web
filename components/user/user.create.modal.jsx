import { Form, Modal } from 'semantic-ui-react';
import { useState } from 'react';
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

const UserCreateModal = ({ trigger }) => {
  const [open, setOpen] = useState(false);

  const [email, setEmail] = useState();
  const [password, setPW] = useState();
  const [name, setName] = useState();
  const [userType, setUserType] = useState();

  const handleSubmit = async () => {
    try {
      await PoPoAxios.post('/user', {
        email: email,
        password: password,
        name: name,
        userType: userType,
      });
      window.location.reload();
    } catch (err) {
      alert('유저 생성에 실패했습니다.');
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
      <Modal.Header>유저 생성</Modal.Header>
      <Modal.Content>
        <Form onSubmit={handleSubmit}>
          <Form.Input
            required
            label={'email'}
            name="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Form.Input
            required
            label={'password'}
            name="password"
            onChange={(e) => setPW(e.target.value)}
          />
          <Form.Input
            required
            label={'이름'}
            name="name"
            onChange={(e) => setName(e.target.value)}
          />
          <Form.Select
            required
            label={'유저 타입'}
            name="userType"
            placeholder="유저 타입을 선택하세요."
            options={userTypeOptions}
            onChange={(e, { value }) => setUserType(value)}
          />
          <Modal.Actions>
            <Form.Button type="submit">생성</Form.Button>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default UserCreateModal;
