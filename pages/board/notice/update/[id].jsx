import { useState } from 'react';
import { useRouter } from 'next/router';
import moment from 'moment';
import { Button, Form, Icon, Message } from 'semantic-ui-react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import DeleteConfirmModal from '@/components/common/delete.confirm.modal';
// import ImageUploadForm from '@/components/common/image-upload.form';

const NoticeUpdatePage = ({ noticeInfo }) => {
  const router = useRouter();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const id = noticeInfo.id;
  const [title, setTitle] = useState(noticeInfo.title);
  const [content, setContent] = useState(noticeInfo.content);
  const [link, setLink] = useState(noticeInfo.link);
  const [start_datetime, setStartDatetime] = useState(
    noticeInfo.start_datetime,
  );
  const [end_datetime, setEndDatetime] = useState(noticeInfo.end_datetime);

  const duration = moment(end_datetime).diff(moment(start_datetime), 'hours');

  const handleSubmit = async () => {
    const body = {
      title: title,
      content: content,
      link: link,
      start_datetime: start_datetime,
      end_datetime: end_datetime,
    };

    if (start_datetime > end_datetime) {
      alert('시작 일자가 종료 일자보다 늦을 수 없습니다.');
      return;
    }

    PoPoAxios.put(`/notice/${id}`, body)
      .then(() => {
        alert('공지사항이 업데이트되었습니다!');
        router.push('/board/notice');
      })
      .catch((err) => {
        const errMsg = err.response.data.message;
        alert(`공지사항 업데이트에 실패했습니다.\n${errMsg}`);
      });
  };

  return (
    <BoardLayout>
      <h3>공지사항 수정</h3>

      <Form>
        <Form.Input
          required
          label={'제목'}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Message>
          공지사항 이미지 업로드는 공지사항 생성 후, 수정 페이지에서 가능합니다.
        </Message>

        <Form.TextArea
          required
          label={'내용'}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <Form.Input
          label={'공지사항 링크'}
          value={link}
          onChange={(e) => setLink(e.target.value)}
        />
        <p>링크가 존재하는 공지사항일 경우 링크를 입력해주세요.</p>

        {/* <ImageUploadForm
          type={'공지사항'}
          uploadApiUri={`notice/image/${id}`}
          originalImageUrl={noticeInfo.image_url}
        />
        <Message>
          권장 이미지 사이즈(가로 x 세로): 540 x 200
        </Message> */}

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

        <Form.Group>
          <Form.Button type={'submit'} onClick={handleSubmit}>
            수정
          </Form.Button>
          <DeleteConfirmModal
            open={deleteModalOpen}
            target={title}
            deleteURI={`notice/${id}`}
            afterDeleteURI={'/board/notice'}
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

export default NoticeUpdatePage;

export async function getServerSideProps(ctx) {
  const { id } = ctx['params'];
  const res = await PoPoAxios.get(`notice/${id}`);
  const noticeInfo = res.data;

  return { props: { noticeInfo } };
}
