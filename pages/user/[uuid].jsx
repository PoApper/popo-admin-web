import { useEffect, useState } from 'react';
import { Button, Form, Tab, Icon, Popup } from 'semantic-ui-react';

import LayoutWithAuth from '@/components/layout/layout.auth.with';
import { PoPoAxios, PaxiAxios } from '@/utils/axios.instance';
import EquipmentReservationTable2 from '@/components/equipment/equipment.reservation.table2';
import PlaceReservationTable2 from '@/components/place/place.reservation.table2';
import PaxiRoomTable from '@/components/paxi/paxi.room.table';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
import { useRouter } from 'next/router';
import moment from 'moment';

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
  const { uuid: routerUuid } = router.query;

  // uuid를 상태로 저장하여 router.query가 undefined일 때도 사용
  const [userUuid, setUserUuid] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [user, setUser] = useState({});
  const [paxiUserInfo, setPaxiUserInfo] = useState({});
  const [placeReservations, setPlaceReservations] = useState([]);
  const [equipReservations, setEquipReservations] = useState([]);
  const [paxiRooms, setPaxiRooms] = useState([]);

  const [email, setEmail] = useState();
  const [name, setName] = useState();
  const [nickname, setNickname] = useState();
  const [userType, setUserType] = useState();
  const [userStatus, setUserStatus] = useState();

  // router.query의 uuid가 변경될 때 상태 업데이트
  useEffect(() => {
    if (routerUuid) {
      setUserUuid(routerUuid);
    }
  }, [routerUuid]);

  useEffect(() => {
    // uuid가 없으면 API 호출하지 않음
    if (!userUuid) {
      setIsLoading(false);
      return;
    }

    const run = async () => {
      setIsLoading(true);
      try {
        const [userRes, placeRes, equipRes, paxiRoomsRes] =
          await Promise.allSettled([
            PoPoAxios.get(`user/admin/${userUuid}`),
            PoPoAxios.get(`reservation-place/user/admin/${userUuid}`),
            PoPoAxios.get(`reservation-equip/user/admin/${userUuid}`),
            PaxiAxios.get(`/room/my/${userUuid}`),
          ]);

        if (userRes.status === 'fulfilled' && userRes.value?.data) {
          setUser(userRes.value.data);
          setEmail(userRes.value.data.email);
          setName(userRes.value.data.name);
          setUserType(userRes.value.data.userType);
          setUserStatus(userRes.value.data.userStatus);
        } else {
          console.warn('유저 기본 정보 불러오기 실패');
        }

        if (placeRes.status === 'fulfilled') {
          setPlaceReservations(placeRes.value.data || []);
        } else {
          console.warn('장소 예약 불러오기 실패');
        }

        if (equipRes.status === 'fulfilled') {
          setEquipReservations(equipRes.value.data || []);
        } else {
          console.warn('장비 예약 불러오기 실패');
        }

        if (paxiRoomsRes.status === 'fulfilled') {
          setPaxiRooms(paxiRoomsRes.value.data || []);
        } else {
          console.warn('Paxi 방 목록 불러오기 실패');
        }

        // Paxi 유저 정보는 별도 호출 (닉네임 등)
        try {
          const paxiRes = await PaxiAxios.get(`/user/my/${userUuid}`);
          if (paxiRes?.data) {
            setPaxiUserInfo(paxiRes.data);
            setNickname(paxiRes.data.nickname || '');
          }
        } catch (e) {
          console.warn('Paxi 유저 정보 불러오기 실패');
        }
      } catch (e) {
        console.log('API 요청 중 오류 발생:', e);
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [userUuid]);

  const handleSubmit = async () => {
    try {
      await PoPoAxios.put(`/user/${user.uuid}`, {
        email: email,
        name: name,
        userType: userType,
        userStatus: userStatus,
      });

      // 닉네임이 변경되고 닉네임이 존재하는 경우에만 paxi API로 닉네임 업데이트
      if (nickname !== paxiUserInfo.nickname && nickname && nickname.trim() !== '') {
        await PaxiAxios.put(`/user/nickname/${userUuid}`, {
          nickname: nickname,
        });
      }

      alert('유저 정보가 성공적으로 수정되었습니다.');
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
                    <Form.Field>
                      <label>
                        닉네임
                        <Popup
                          trigger={
                            <Icon
                              name="question circle"
                              style={{
                                marginLeft: '3px',
                                color: '#666',
                                cursor: 'default',
                              }}
                            />
                          }
                          content="Paxi 카풀 서비스 이용 시, 실명 대신 사용됩니다"
                          position="top left"
                          size="small"
                        />
                      </label>
                      <Form.Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        placeholder="닉네임을 입력하세요"
                      />
                    </Form.Field>
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
                        <p>
                          {moment(user.createdAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </Form.Field>
                      <Form.Field style={{ flex: 1 }}>
                        <label>마지막 로그인</label>
                        <p>
                          {moment(user.lastLoginAt).format('YYYY-MM-DD HH:mm')}
                        </p>
                      </Form.Field>
                    </Form.Group>

                    {paxiUserInfo.accountNumber && (
                      <Form.Group style={{ display: 'flex' }}>
                        <Form.Field style={{ flex: 1 }}>
                          <label>계좌번호</label>
                          <p>{paxiUserInfo.accountNumber}</p>
                        </Form.Field>
                        <Form.Field style={{ flex: 1 }}>
                          <label>계좌주명</label>
                          <p>{paxiUserInfo.accountHolderName}</p>
                        </Form.Field>
                      </Form.Group>
                    )}

                    {paxiUserInfo.bankName && (
                      <Form.Field>
                        <label>은행명</label>
                        <p>{paxiUserInfo.bankName}</p>
                      </Form.Field>
                    )}

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
            {
              menuItem: `카풀 참여 현황 (${paxiRooms.length}개)`,
              render: () => (
                <Tab.Pane>
                  <h3>카풀 참여 현황 ({paxiRooms.length}개)</h3>
                  <PaxiRoomTable
                    rooms={paxiRooms}
                    startIdx={1}
                    userUuid={userUuid}
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
