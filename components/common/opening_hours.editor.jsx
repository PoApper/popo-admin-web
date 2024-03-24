import { useState } from 'react';
import { Button, Icon, Input, Popup } from 'semantic-ui-react';

const Weekdays = [
  { key: 'Monday', label: '월' },
  { key: 'Tuesday', label: '화' },
  { key: 'Wednesday', label: '수' },
  { key: 'Thursday', label: '목' },
  { key: 'Friday', label: '금' },
  { key: 'Saturday', label: '토' },
  { key: 'Sunday', label: '일' },
];

const EverydayDefault = { Everyday: '00:00-24:00' };
const WeekdayDefault = {
  Monday: '00:00-24:00',
  Tuesday: '00:00-24:00',
  Wednesday: '00:00-24:00',
  Thursday: '00:00-24:00',
  Friday: '00:00-24:00',
  Saturday: '00:00-24:00',
  Sunday: '00:00-24:00',
};

export function checkValid(hour_ranges) {
  if (!hour_ranges) return true;
  // eslint-disable-next-line
  const pattern1 = RegExp(/^[0-9 ,:\-]+/);
  if (!pattern1.test(hour_ranges)) {
    return false;
  }

  const pattern2 = RegExp(/\d{2}:\d{2}-\d{2}:\d{2}/);
  const range_list = hour_ranges.split(',');
  for (const hour_range of range_list) {
    if (!pattern2.test(hour_range)) {
      return false;
    }
  }
  return true;
}

const OpeningHoursEditor = ({
  currentOpeningHour,
  openingHour,
  setOpeningHours,
}) => {
  const [type, setType] = useState(
    currentOpeningHour['Everyday'] ? 'Everyday' : 'Weekdays',
  );

  function updateOpeningHour(key, value) {
    openingHour[key] = value;
    setOpeningHours(Object.assign({}, openingHour));
  }

  return (
    <div style={{ marginBottom: 8 }} className={'required field'}>
      <label>
        사용 가능 시간 &nbsp;
        <Popup trigger={<Icon name={'question circle'} />}>
          값을 넣을 떄, 형식을 준수해주세요. 시작과 끝 시간은 `HH:MM-HH:MM`으로
          표현하고, 둘 이상의 범위는 콤마(,)로 구분합니다. 기본값은 `매일
          24시간`입니다.
        </Popup>
      </label>
      <Button.Group size={'mini'} style={{ margin: '8px 0' }}>
        <Button
          onClick={() => {
            setType('Everyday');
            currentOpeningHour['Everyday']
              ? setOpeningHours(currentOpeningHour)
              : setOpeningHours(EverydayDefault);
          }}
        >
          매일
        </Button>
        <Button
          onClick={() => {
            setType('Weekdays');
            currentOpeningHour['Everyday']
              ? setOpeningHours(WeekdayDefault)
              : setOpeningHours(currentOpeningHour);
          }}
        >
          요일별
        </Button>
      </Button.Group>

      <div style={{ maxWidth: 400 }}>
        {type === 'Everyday' ? (
          <div>
            <Input
              key="Everyday"
              label="매일"
              value={openingHour['Everyday']}
              onChange={(evt) =>
                updateOpeningHour('Everyday', evt.target.value)
              }
              className={checkValid(openingHour['Everyday']) ? 'green' : 'red'}
              placeholder="08:00-14:00, 20:00-24:00"
              size={'mini'}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {Weekdays.map((weekday) => (
              <Input
                key={weekday.key}
                label={weekday.label}
                value={openingHour[weekday.key]}
                onChange={(evt) =>
                  updateOpeningHour(weekday.key, evt.target.value)
                }
                className={
                  checkValid(openingHour[weekday.key]) ? 'green' : 'red'
                }
                placeholder="08:00-14:00, 20:00-24:00"
                size={'mini'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpeningHoursEditor;
