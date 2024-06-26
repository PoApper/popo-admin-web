import moment from 'moment';
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { roundUpByDuration } from '@/utils/time-date';

const ReservationDatetimePicker = ({
  date,
  startTime,
  endTime,
  setDate,
  setStartTime,
  setEndTime,
}) => {
  const now = roundUpByDuration(moment(), 30);
  const nowNext30Min = moment(now).add(30, 'minute');

  return (
    <>
      <div className={'required field'}>
        <label>날짜</label>
        <DatePicker
          onKeyDown={(e) => e.preventDefault()}
          dateFormat={'yyyy-MM-dd'}
          minDate={now.toDate()}
          // maxDate={now.add(30, 'day').toDate()}
          selected={date.toDate()}
          onChange={(date) => {
            const targetDate = moment(date).format('YYYY-MM-DD');
            const nowDate = now.format('YYYY-MM-DD');
            if (targetDate === nowDate) {
              setDate(now);
              setStartTime(now);
              setEndTime(nowNext30Min);
            } else {
              setDate(moment(targetDate + 'T00:00'));
              setStartTime(moment(targetDate + 'T00:00'));
              setEndTime(moment(targetDate + 'T00:30'));
            }
          }}
        />
      </div>

      <div className={'required field'}>
        <label>시작 시간</label>
        <DatePicker
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          onKeyDown={(e) => e.preventDefault()}
          dateFormat={'hh:mm aa'}
          selected={startTime.toDate()}
          minTime={date.toDate()}
          maxTime={moment(date.format('YYYY-MM-DD') + 'T23:59').toDate()}
          onChange={(startTime) => {
            const newStartTime = moment(startTime);
            const newStartTimeNext30Min = moment(newStartTime).add(
              30,
              'minute',
            );
            setStartTime(newStartTime);
            setEndTime(newStartTimeNext30Min);
          }}
        />
      </div>

      <div className={'required field'}>
        <label>종료 시간</label>
        <DatePicker
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          onKeyDown={(e) => e.preventDefault()}
          dateFormat={'hh:mm aa'}
          selected={endTime.toDate()}
          minTime={moment(startTime).add(30, 'minute').toDate()}
          maxTime={
            endTime.format('HHmm') === '0000'
              ? moment(date.format('YYYY-MM-DD') + 'T00:00').toDate() // edge-case
              : moment(date.format('YYYY-MM-DD') + 'T23:59').toDate()
          }
          onChange={(endTime) => {
            setEndTime(moment(endTime));
          }}
        />
      </div>
    </>
  );
};

export default ReservationDatetimePicker;
