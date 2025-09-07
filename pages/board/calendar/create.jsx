import { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Form, Message } from 'semantic-ui-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';

const CalendarCreatePage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState();

  const dDay = moment(eventDate).diff(moment(), 'days');

  const handleSubmit = async () => {
    const body = {
      title: title,
      eventDate: eventDate,
    };

    PoPoAxios.post('/calendar', body)
      .then(() => {
        alert('학사일정이 등록되었습니다!');
        router.push('/board/calendar');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`학사일정 등록에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>학사일정 생성</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Input
          required
          label={'제목'}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <div className={'required field'}>
            <label>시작 날짜</label>
            <ReactDatePicker
              selected={eventDate ? moment(eventDate).toDate() : null}
              onChange={(date) =>
                setEventDate(moment(date).format('YYYY-MM-DD'))
              }
              onKeyDown={(e) => e.preventDefault()}
              dateFormat="yyyy-MM-dd"
            />
          </div>
        </div>
        <Message>
          {!eventDate
            ? '게시 시작 날짜와 종료 날짜를 입력해주세요.'
            : `D-${dDay}`}
        </Message>

        <Form.Button type={'submit'}>생성</Form.Button>
      </Form>
    </BoardLayout>
  );
};

export default CalendarCreatePage;
