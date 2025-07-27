import { ResponsiveBar } from '@nivo/bar';
import { useEffect, useState } from 'react';
import { PoPoAxios } from '@/utils/axios.instance';

const NewUserBar = ({ year }) => {
  const [barData, setBarData] = useState([]);

  useEffect(() => {
    PoPoAxios.get(`/statistics/user?start=${year}01&end=${year + 1}01`).then(
      (res) => {
        // process data format
        const barData = [];
        for (const [key, value] of Object.entries(res.data.data)) {
          barData.push({
            month: key,
            'new-user': value,
          });
        }
        setBarData(barData);
      },
    );
  }, [year]);

  return (
    <>
      <ResponsiveBar
        data={barData}
        keys={['new-user']}
        indexBy={'month'}
        isInteractive={false}
        minValue={0}
        margin={{ top: 10, right: 50, bottom: 30, left: 50 }}
      />
    </>
  );
};

export default NewUserBar;
