import { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Button, Form, Icon, Message } from 'semantic-ui-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';

const CalendarUpdatePage = ({ calendarInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const id = calendarInfo.id;
  const [title, setTitle] = useState(calendarInfo.title);
  const [eventDate, setEventDate] = useState(calendarInfo.eventDate);

  const dDay = moment(eventDate).diff(moment(), 'days');

  const handleSubmit = async () => {
    const body = {
      title: title,
      eventDate: eventDate,
    };

    PoPoAxios.put(`/calendar/${id}`, body)
      .then(() => {
        alert('학사일정이 업데이트되었습니다!');
        router.push('/board/calendar');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`학사일정 업데이트에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>학사일정 수정</h3>

      <Form>
        <Form.Input
          required
          label={'제목'}
          value={title}
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
            : dDay
              ? `D-${dDay}`
              : 'D-Day'}
        </Message>

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={title}
            deleteURI={`calendar/${id}`}
            afterDeleteURI={'/board/calendar'}
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

export default CalendarUpdatePage;

export async function getServerSideProps(ctx) {
  const { id } = ctx['params'];
  const res = await PoPoAxios.get(`calendar/${id}`);
  const calendarInfo = res.data;

  return { props: { calendarInfo } };
}
