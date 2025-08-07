import { useEffect, useState } from 'react';
import { Button, Form, Tab } from 'semantic-ui-react';

import LayoutWithAuth from '@/components/layout/layout.auth.with';
import { PoPoAxios } from '@/utils/axios.instance';
import EquipmentReservationTable2 from '@/components/equipment/equipment.reservation.table2';
import PlaceReservationTable2 from '@/components/place/place.reservation.table2';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import { useRouter } from 'next/router';

const userTypeOptions = [
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

const UserDetailPage = () => {
  const router = useRouter();
  const { uuid } = router.query;

  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [user, setUser] = useState({});
  const [placeReservations, setPlaceReservations] = useState([]);
  const [equipReservations, setEquipReservations] = useState([]);

  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [userType, setUserType] = useState();
  const [userStatus, setUserStatus] = useState();

  useEffect(() => {
    setIsLoading(true);
    const fetchUser = PoPoAxios.get(`user/admin/${uuid}`);
    const fetchPlaceReservations = PoPoAxios.get(
      `reservation-place/user/admin/${uuid}`,
    );
    const fetchEquipReservations = PoPoAxios.get(
      `reservation-equip/user/admin/${uuid}`,
    );

    Promise.all([fetchUser, fetchPlaceReservations, fetchEquipReservations])
      .then(([userRes, placeRes, equipRes]) => {
        setUser(userRes.data);
        setEmail(userRes.data.email);
        setName(userRes.data.name);
        setUserType(userRes.data.userType);
        setUserStatus(userRes.data.userStatus);

        setPlaceReservations(placeRes.data);
        setEquipReservations(equipRes.data);

        setIsLoading(false);
      })
      .catch((err) => {
        console.log('API 요청 중 오류 발생:', err);
      });
  }, [uuid]);

  const handleSubmit = async () => {
    try {
      await PoPoAxios.put(`/user/${user.uuid}`, {
        email: email,
        name: name,
        userType: userType,
        userStatus: userStatus,
      });
      router.push('/user');
    } catch (err) {
      alert('유저 정보 수정에 실패했습니다.');
      console.log(err);
    }
  };

  return (
    <LayoutWithAuth>
      <h2>유저 세부 정보</h2>

      <div style={{ marginBottom: '1rem' }}>
        <Button onClick={() => window.history.back()}>뒤로가기</Button>
      </div>

      {isLoading ? (
        <div>유저 정보 로딩 중...</div>
      ) : (
        <Tab
          panes={[
            {
              menuItem: '유저 정보',
              render: () => (
                <Tab.Pane>
                  <h3>유저 정보</h3>

                  <Form>
                    <Form.Field>
                      <label>UUID</label>
                      <p>{user.uuid}</p>
                    </Form.Field>
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
                    <Form.Group style={{ display: 'flex' }}>
                      <Form.Field style={{ flex: 1 }}>
                        <label>생성일</label>
                        <p>{user.createdAt}</p>
                      </Form.Field>
                      <Form.Field style={{ flex: 1 }}>
                        <label>마지막 로그인</label>
                        <p>{user.lastLoginAt}</p>
                      </Form.Field>
                    </Form.Group>
                    <Form.Group>
                      <Form.Button type="submit" onClick={handleSubmit}>
                        수정
                      </Form.Button>
                      <DeleteConfirmModal
                        open={deleteModalOpen}
                        target={`${name}(${email})`}
                        deleteURI={`user/${user.uuid}`}
                        trigger={
                          <Button
                            negative
                            onClick={() => setDeleteModalOpen(true)}
                          >
                            삭제
                          </Button>
                        }
                      />
                    </Form.Group>
                  </Form>
                </Tab.Pane>
              ),
            },
            {
              menuItem: `장소 예약 목록 (${placeReservations.length}개)`,
              render: () => (
                <Tab.Pane>
                  <h3>장소 예약 목록 ({placeReservations.length}개)</h3>
                  <PlaceReservationTable2
                    reservations={placeReservations}
                    startIdx={1}
                  />
                </Tab.Pane>
              ),
            },
            {
              menuItem: `장비 예약 목록 (${equipReservations.length}개)`,
              render: () => (
                <Tab.Pane>
                  <h3>장비 예약 목록 ({equipReservations.length}개)</h3>
                  <EquipmentReservationTable2
                    reservations={equipReservations}
                    startIdx={1}
                  />
                </Tab.Pane>
              ),
            },
          ]}
        />
      )}
    </LayoutWithAuth>
  );
};

export default UserDetailPage;
