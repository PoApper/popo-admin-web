import { Button, Form, Icon, Modal, Segment } from 'semantic-ui-react';
import React, { useState } from 'react';
import moment from 'moment';
import DeleteConfirmModal from '../common/delete.confirm.modal';
import { PoPoAxios } from '@/utils/axios.instance';

const PlaceReservationConfirmModal = ({ trigger, reservation }) => {
  const [open, setOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const handlePatch = async (e, data) => {
    try {
      const patchType = data.name; // {accept, reject}
      await PoPoAxios.patch(
        `/reservation-place/${reservation.uuid}/status/${patchType}?sendEmail=${sendEmail}`,
      );
      setOpen(false);
      window.location.reload();
    } catch (err) {
      const errMsg = err.response.data.message;
      alert(`예약 승인/거절에 실패했습니다.\n${errMsg}`);
    }
  };

  return (
    <Modal
      closeIcon
      open={open}
      trigger={trigger}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
    >
      <Modal.Header>예약 승인/거절</Modal.Header>
      <Modal.Content>
        <Segment.Group>
          <Segment>
            <h4>장소</h4>
            <div>{reservation.place.name}</div>
          </Segment>
          <Segment>
            <h4>사용자</h4>
            <div>{reservation.booker.name}</div>
          </Segment>
          <Segment>
            <h4>전화번호</h4>
            <div>{reservation.phone}</div>
          </Segment>
          <Segment>
            <h4>예약 제목</h4>
            <div>{reservation.title}</div>
          </Segment>
          <Segment>
            <h4>설명</h4>
            <div>{reservation.description}</div>
          </Segment>
          <Segment>
            <h4>예약 기간</h4>
            <div>
              <b>
                {moment(reservation.date, 'YYYYMMDD').format('YYYY-MM-DD')}
                &nbsp;
                {moment(reservation.startTime, 'HHmm').format('HH:mm')}
                &nbsp;~&nbsp;
                {moment(reservation.endTime, 'HHmm').format('HH:mm')}
              </b>
            </div>
          </Segment>
          <Segment>
            <h4>생성일</h4>
            <div>
              {moment(reservation.createdAt).format('YYYY-MM-DD HH:mm')}
            </div>
          </Segment>
        </Segment.Group>

        <Form style={{ marginBottom: '5rem' }}>
          <Form.Checkbox
            label={'승인 메일 보내기'}
            checked={sendEmail}
            onClick={() => setSendEmail(!sendEmail)}
          />
          <Modal.Actions>
            <Button.Group floated={'left'}>
              <Button positive name={'통과'} onClick={handlePatch}>
                <Icon name={'check'} /> 예약 승인
              </Button>
              <Button negative name={'거절'} onClick={handlePatch}>
                <Icon name={'ban'} /> 예약 거절
              </Button>
            </Button.Group>
            <Button.Group floated={'right'}>
              <DeleteConfirmModal
                target={reservation.title}
                deleteURI={`reservation-place/${reservation.uuid}`}
                trigger={
                  <Button negative>
                    <Icon name={'trash'} /> 예약 삭제
                  </Button>
                }
              />
            </Button.Group>
          </Modal.Actions>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default PlaceReservationConfirmModal;
