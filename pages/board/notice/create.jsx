import { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Form, Message } from 'semantic-ui-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';

const NoticeCreatePage = () => {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState();
  const [link, setLink] = useState();
  const [start_datetime, setStartDatetime] = useState();
  const [end_datetime, setEndDatetime] = useState();

  const duration = moment(end_datetime).diff(moment(start_datetime), 'hours');

  const handleSubmit = async () => {
    const body = {
      title: title,
      content: content,
      link: link,
      start_datetime: start_datetime,
      end_datetime: end_datetime,
    };

    if (!start_datetime || !end_datetime) {
      alert('시작 일자와 종료 일자를 입력해주세요.');
      return;
    }

    if (start_datetime > end_datetime) {
      alert('시작 일자가 종료 일자보다 늦을 수 없습니다.');
      return;
    }

    PoPoAxios.post('/notice', body)
      .then(() => {
        alert('공지사항이 등록 되었습니다!');
        router.push('/board/notice');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`공지사항 등록에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>공지사항 생성</h3>

      <Form onSubmit={handleSubmit}>
        <Form.Input
          required
          label={'제목'}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Message warning>
          공지사항 이미지 업로드는 공지사항 생성 후, 등록 할 수 있습니다.
        </Message>

        <Form.TextArea
          required
          label={'내용'}
          onChange={(e) => setContent(e.target.value)}
        />

        <Form.Input
          label={'공지사항 링크'}
          onChange={(e) => setLink(e.target.value)}
        />
        <p>링크가 존재하는 공지사항일 경우 링크를 입력해주세요.</p>

        <div style={{ display: 'flex', gap: 12 }}>
          <div className={'required field'}>
            <label>시작 날짜</label>
            <ReactDatePicker
              selected={start_datetime ? moment(start_datetime).toDate() : null}
              onChange={(date) =>
                setStartDatetime(moment(date).format('YYYY-MM-DD HH:mm:ss'))
              }
              onKeyDown={(e) => e.preventDefault()}
              dateFormat="yyyy-MM-dd HH:mm"
              timeIntervals={60}
              minDate={new Date()}
              showTimeSelect
            />
          </div>
          <div className={'required field'}>
            <label>종료 날짜</label>
            <ReactDatePicker
              selected={end_datetime ? moment(end_datetime).toDate() : null}
              onChange={(date) =>
                setEndDatetime(moment(date).format('YYYY-MM-DD HH:mm:ss'))
              }
              onKeyDown={(e) => e.preventDefault()}
              dateFormat="yyyy-MM-dd HH:mm"
              timeIntervals={60}
              minDate={moment(start_datetime).toDate()}
              showTimeSelect
            />
          </div>
        </div>
        <Message>
          {!start_datetime || !end_datetime
            ? '게시 시작 날짜와 종료 날짜를 입력해주세요.'
            : start_datetime > end_datetime
              ? '시작 날짜가 종료 날짜보다 늦을 수 없습니다.'
              : `게시 기간: ${start_datetime} ~ ${end_datetime} (${Number(duration / 24).toFixed(0)}일 ${duration % 24}시간)`}
        </Message>

        <Form.Button type={'submit'}>생성</Form.Button>
      </Form>
    </BoardLayout>
  );
};

export default NoticeCreatePage;
