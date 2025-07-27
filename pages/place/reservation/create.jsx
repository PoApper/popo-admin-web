import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Divider, Form, Message } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import { PoPoAxios } from '@/utils/axios.instance';
import { RegionOptions } from '@/assets/region.options';
import { hourDiff, roundUpByDuration } from '@/utils/time-date';
import ReservationDatetimePicker from '@/components/reservation/reservation.datetime.picker';
import OpeningHoursList from '@/components/reservation/opening_hours.list';
import { isOnOpeningHours } from '@/utils/opening_hours';

const RegionKorNameMapping = {
  STUDENT_HALL: '학생 회관',
  JIGOK_CENTER: '지곡 회관',
  OTHERS: '기타',
  COMMUNITY_CENTER: '커뮤니티 센터',
  RESIDENTIAL_COLLEGE: 'RC',
};

const PlaceReservationCreatePage = ({ placeList }) => {
  const router = useRouter();

  const [region, setRegion] = useState();

  const filteredPlaceList = useMemo(() => {
    return placeList.filter((place) => place.region === region);
  }, [region, placeList]);

  const placeOptions = filteredPlaceList.map((place) => {
    return {
      key: place.id,
      value: place,
      text: place.name,
    };
  });

  const [placeInfo, setPlaceInfo] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const [phone, setPhone] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const now = roundUpByDuration(moment(), 30);
  const nowNext30Min = moment(now).add(30, 'minute');

  const [date, setDate] = useState(now); // YYYY-MM-DD
  const [startTime, setStartTime] = useState(now); // HHmm
  const [endTime, setEndTime] = useState(nowNext30Min); // HHmm

  const isPossible = placeInfo
    ? isOnOpeningHours(
        placeInfo.opening_hours,
        date.format('dddd'), // Monday
        startTime.format('HH:mm'),
        endTime.format('HH:mm'),
      )
    : false;

  useEffect(() => {
    PoPoAxios.get('/auth/verifyToken')
      .then((res) => setUserInfo(res.data))
      .catch(() => {
        // alert('로그인 후 예약 할 수 있습니다.');
        // router.push('/auth/login');
      });
  }, [router]);

  function handleSubmit() {
    if (title.length == 1 || description.length == 1) {
      alert('예약 설명이 너무 짤습니다.');
      return;
    }

    PoPoAxios.post('/reservation-place', {
      place_id: placeInfo.uuid,
      phone: phone,
      title: title,
      description: description,
      date: date.format('YYYYMMDD'), // YYYYMMDD
      start_time: startTime.format('HHmm'), // HHmm
      end_time: endTime.format('HHmm'), // HHmm
    })
      .then(() => {
        alert('예약을 생성했습니다!');
        router.push('/place/reservation');
      })
      .catch((error) => {
        alert(`예약 생성에 실패했습니다: ${error.response.data.message}`);
      });
  }

  return (
    <ReservationLayout>
      <h1>장소 예약 생성 (관리자)</h1>

      <Message>
        일반 유저는 한달 이내 예약만 생성 가능하지만, 관리자 페이지에서는 한달
        이후 예약도 생성 가능합니다.
      </Message>

      <Form>
        <Form.Group>
          <Form.Select
            required
            label={'지역'}
            name="region"
            options={RegionOptions}
            value={region}
            onChange={(e, { value }) => setRegion(value)}
          />
          <Form.Select
            required
            label={'장소'}
            name="place"
            options={placeOptions}
            value={placeOptions.id}
            onChange={(e, { value }) => setPlaceInfo(value)}
          />
        </Form.Group>

        <Form.Input
          required
          readOnly
          label={'사용자'}
          value={userInfo ? userInfo.name : ''}
        />

        <Form.Input
          required
          label={'전화번호'}
          placeholder={'010-xxxx-xxxx'}
          onChange={(e) => setPhone(e.target.value)}
        />
        <Form.Input
          required
          label={'예약 제목'}
          placeholder={'예약 제목을 작성해주세요.'}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Form.TextArea
          required
          label={'설명'}
          placeholder={'사용 인원을 꼭 작성 해주세요.'}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Divider />

        {placeInfo ? (
          <>
            <Form.Group>
              <ReservationDatetimePicker
                date={date}
                startTime={startTime}
                endTime={endTime}
                setDate={setDate}
                setStartTime={setStartTime}
                setEndTime={setEndTime}
              />
            </Form.Group>

            <div className={'field'} style={{ maxWidth: 240 }}>
              <label>사용 가능 시간</label>
              <div style={{ color: 'gray' }}>
                <OpeningHoursList
                  openingHours={JSON.parse(placeInfo.opening_hours)}
                />
              </div>
            </div>

            <Message>
              <Message.Header>
                예약 장소와 예약 시간을 꼭 확인해주세요!
              </Message.Header>
              <p>
                {RegionKorNameMapping[placeInfo.region]} {placeInfo.name},{' '}
                {hourDiff(startTime, endTime)}시간 예약입니다.
              </p>
            </Message>

            {!isPossible ? (
              <Message negative>
                선택하신 시간 대는 예약이 <b>불가능한</b> 시간대로 설정 되어
                있습니다. 다만, 관리자 화면에서는 강제로 {placeInfo.name}에 대한
                예약을 진행할 수 있습니다. 계속 진행하시겠습니까?
              </Message>
            ) : null}

            <Form.Button onClick={handleSubmit}>생성</Form.Button>
          </>
        ) : null}
      </Form>
    </ReservationLayout>
  );
};

export default PlaceReservationCreatePage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('place');
  const placeList = res.data;

  return { props: { placeList } };
}
