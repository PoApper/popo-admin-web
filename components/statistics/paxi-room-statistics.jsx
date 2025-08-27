import { useEffect, useMemo, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';

import { PaxiAxios } from '@/utils/axios.instance';

const buildStackedBarData = (monthlyMap, field) => {
  // Collect all keys across months (excluding 'total') for stable keys order
  const keySet = new Set();
  Object.values(monthlyMap).forEach((dto) => {
    const counts = dto[field] || {};
    Object.keys(counts)
      .filter((k) => k !== 'total')
      .forEach((k) => keySet.add(k));
  });
  const keys = Array.from(keySet);

  // Build data rows per month
  const data = Object.entries(monthlyMap)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, dto]) => {
      const row = { month };
      const counts = dto[field] || {};
      keys.forEach((k) => {
        row[k] = counts[k] || 0;
      });
      return row;
    });

  return { data, keys };
};

const colorsFor = (keys) => {
  // Deterministic color mapping
  const palette = [
    '#4e79a7',
    '#f28e2b',
    '#e15759',
    '#76b7b2',
    '#59a14f',
    '#edc948',
    '#b07aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
  ];
  const map = {};
  keys.forEach((k, i) => {
    map[k] = palette[i % palette.length];
  });
  return ({ id }) => map[id] || '#888';
};

const identity = (v) => v;

const Chart = ({ title, data, keys, labelMap = identity }) => {
  const getColor = colorsFor(keys);
  return (
    <div style={{ marginTop: 16 }}>
      <h3>{title}</h3>
      <div style={{ height: 360 }}>
        <ResponsiveBar
          data={data}
          keys={keys}
          indexBy={'month'}
          minValue={0}
          margin={{ top: 10, right: 50, bottom: 30, left: 50 }}
          padding={0.25}
          colors={getColor}
          axisBottom={{ tickRotation: 0 }}
          isInteractive={true}
          tooltip={({ id, value, color, indexValue }) => (
            <div
              style={{
                background: 'white',
                border: '1px solid #ddd',
                padding: '6px 8px',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    background: color,
                    display: 'inline-block',
                  }}
                />
                <span style={{ fontWeight: 'bold' }}>{indexValue}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                {labelMap(id)}: {value}
              </div>
            </div>
          )}
        />
      </div>
      {keys.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {keys.map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  width: 12,
                  height: 12,
                  background: getColor({ id: k }),
                  display: 'inline-block',
                  marginRight: 6,
                }}
              />
              <span style={{ fontSize: '0.9em' }}>{labelMap(k)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PaxiRoomStatistics = ({ year }) => {
  const [raw, setRaw] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await PaxiAxios.get('/room/statistics', {
          params: {
            startDate: `${year}0101`,
            endDate: `${year}1231`,
          },
        });
        setRaw(res.data?.data || {});
      } catch (e) {
        console.error('Paxi room statistics fetch failed:', e);
        setError('통계 데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [year]);

  const { status, departure, destination } = useMemo(() => {
    return {
      status: buildStackedBarData(raw, 'statusCounts'),
      departure: buildStackedBarData(raw, 'departureLocationCounts'),
      destination: buildStackedBarData(raw, 'destinationLocationCounts'),
    };
  }, [raw]);

  if (loading) return <div>통계를 불러오는 중...</div>;
  if (error) return <div>{error}</div>;

  const statusLabel = (k) => {
    switch (k) {
      case 'ACTIVE':
        return '출발 전';
      case 'IN_SETTLEMENT':
        return '정산 중';
      case 'COMPLETED':
        return '정산 완료';
      case 'DEACTIVATED':
        return '비활성화';
      case 'DELETED':
        return '삭제됨';
      default:
        return k;
    }
  };

  return (
    <>
      <Chart
        title={'방 상태별 생성 수'}
        data={status.data}
        keys={status.keys}
        labelMap={statusLabel}
      />
      <Chart
        title={'출발지별 생성 수'}
        data={departure.data}
        keys={departure.keys}
      />
      <Chart
        title={'도착지별 생성 수'}
        data={destination.data}
        keys={destination.keys}
      />
    </>
  );
};

export default PaxiRoomStatistics;
