import React from 'react';
import Link from 'next/link';
import { Button, Select } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import PlaceTable from '@/components/place/place.table';
import { PoPoAxios } from '@/utils/axios.instance';
import { RegionOptions } from '@/assets/region.options';

const PlaceRegionOptions = [
  { key: 'ALL', value: 'ALL', text: '전체' },
  ...RegionOptions,
];

const PlacePage = ({ placeList }) => {
  const [selectedRegion, setSelectedRegion] = React.useState('ALL');

  const filteredPlaceList = React.useMemo(() => {
    if (selectedRegion === 'ALL') return placeList;
    return placeList.filter((place) => place.region === selectedRegion);
  }, [selectedRegion, placeList]);

  return (
    <ReservationLayout>
      <h3>장소 목록</h3>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Link href={'/place/create'}>
            <Button>장소 생성</Button>
          </Link>
        </div>
        <div>
          <Select
            value={selectedRegion}
            options={PlaceRegionOptions}
            onChange={(e, { value }) => setSelectedRegion(value)}
          />
        </div>
      </div>
      <p>테이블 헤더를 클릭하여 정렬 방식을 변경할 수 있습니다.</p>
      <div>
        <PlaceTable placeList={filteredPlaceList} />
      </div>
    </ReservationLayout>
  );
};

export default PlacePage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('place');
  const placeList = res.data;

  return { props: { placeList } };
}
