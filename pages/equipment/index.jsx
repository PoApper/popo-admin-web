import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Select } from 'semantic-ui-react';

import ReservationLayout from '@/components/reservation/reservation.layout';
import EquipmentTable from '@/components/equipment/equipment.table';
import { PoPoAxios } from '@/utils/axios.instance';
import { OwnerOptions } from '@/assets/owner.options';

const EquipmentOwnerOptions = [
  { key: 'ALL', value: 'ALL', text: '전체' },
  ...OwnerOptions,
];

const EquipmentPage = ({ equipmentList }) => {
  const [selectedOwner, setSelectedOwner] = useState('ALL');

  const filteredEquipmentList = useMemo(() => {
    if (selectedOwner === 'ALL') return equipmentList;
    return equipmentList.filter(
      (equipment) => equipment.equipOwner === selectedOwner,
    );
  }, [selectedOwner, equipmentList]);

  return (
    <ReservationLayout>
      <h3>장비 목록</h3>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <Link href={'/equipment/create'}>
            <Button>장비 생성</Button>
          </Link>
        </div>
        <div>
          <Select
            value={selectedOwner}
            options={EquipmentOwnerOptions}
            onChange={(e, { value }) => setSelectedOwner(value)}
          />
        </div>
      </div>
      <p>
        예약은 생성일 순서로 정렬되어 표시됩니다!
        <br />
        예약 내용을 수정하는 건 <b>불가능</b>합니다. 예약 승인/거절/삭제만
        가능합니다.
      </p>
      <div>
        <EquipmentTable equipmentList={filteredEquipmentList} />
      </div>
    </ReservationLayout>
  );
};

export default EquipmentPage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('equip');
  const equipmentList = res.data;

  return { props: { equipmentList } };
}
