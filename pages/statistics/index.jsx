import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Dropdown, List } from 'semantic-ui-react';
import moment from 'moment';

import LayoutWithAuth from '@/components/layout/layout.auth.with';

// https://github.com/plouc/nivo/issues/1941
const NewUserBar = dynamic(
  () => import('../../components/statistics/new-user.bar'),
  { ssr: false },
);
const NewReservationBar = dynamic(
  () => import('../../components/statistics/new-reservation.bar'),
  { ssr: false },
);

const StatisticsPage = () => {
  const thisYear = moment().year();
  const popoStartYear = 2021;

  const [year, setYear] = useState(thisYear);

  const YearOptions = Array.from(
    { length: thisYear - popoStartYear + 1 },
    (v, k) => {
      return {
        key: k + popoStartYear,
        text: `${k + popoStartYear}년`,
        value: k + popoStartYear,
      };
    },
  );

  return (
    <LayoutWithAuth>
      <h2>POPO 통계</h2>
      <p>
        We don&apos;t have better algorithms, we just have more data.
        <br />
        데이터를 통해 POPO를 유연하게 관리하고 활용해봅시다!
      </p>
      <div>
        <Dropdown
          placeholder={'Select Year'}
          options={YearOptions}
          value={year}
          onChange={(_, { value }) => {
            setYear(value);
          }}
        />
      </div>
      <h3>신규 유저</h3>
      <div style={{ height: 360 }}>
        <NewUserBar year={year} />
      </div>
      <hr />
      <h3>신규 장소 예약</h3>
      <div style={{ height: 360 }}>
        <NewReservationBar year={year} />
      </div>
      <hr />
      <h3>ToDo List 🚀</h3>
      <List as="ul">
        <List.Item as="li">일일 활성 유저 (Daily Active User)</List.Item>
      </List>
    </LayoutWithAuth>
  );
};

export default StatisticsPage;
