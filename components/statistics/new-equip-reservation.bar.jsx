import { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';

import { PoPoAxios } from '@/utils/axios.instance';

const NewEquipReservationBar = ({ year }) => {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    PoPoAxios.get(
      // 현재는 통계 데이터 조회가 Public API 이므로 withCredentials 옵션 필요 없음
      `/statistics/reservation/equipment?start=${year}01&end=${year + 1}01`,
    ).then((res) => {
      // process data format
      const barData = [];
      for (const [key, value] of Object.entries(res.data.data)) {
        barData.push({
          month: key,
          'new-reservation': value,
        });
      }
      setBarData(barData);
    });
  }, [year]);

  return (
    <>
      <ResponsiveBar
        data={barData}
        keys={['new-reservation']}
        indexBy={'month'}
        minValue={0}
        isInteractive={false}
        colors={{ scheme: 'dark2' }}
        margin={{ top: 10, right: 50, bottom: 30, left: 50 }}
      />
    </>
  );
};

export default NewEquipReservationBar;
