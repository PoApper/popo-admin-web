import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { Button, Select } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import ClubTable from '@/components/introduce/club.table';
import { PoPoAxios } from '@/utils/axios.instance';
import { ClubTypeOptions } from '@/assets/club.type.options';

const SelectClubTypeOptions = [
  { key: 'ALL', value: 'ALL', text: '전체' },
  ...ClubTypeOptions,
];

const ClubIntroducePage = ({ clubList }) => {
  const [selectedClubType, setSelectedClubType] = useState('ALL');

  const filteredClubList = useMemo(() => {
    if (selectedClubType === 'ALL') return clubList;
    return clubList.filter((club) => club.clubType === selectedClubType);
  }, [selectedClubType, clubList]);

  return (
    <IntroduceLayout>
      <h3>동아리 소개글</h3>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <Link href={'/introduce/club/create'}>
            <Button>동아리 생성</Button>
          </Link>
        </div>
        <div>
          <Select
            value={selectedClubType}
            options={SelectClubTypeOptions}
            onChange={(e, { value }) => setSelectedClubType(value)}
          />
        </div>
      </div>
      <div>
        <ClubTable clubs={filteredClubList} />
      </div>
    </IntroduceLayout>
  );
};

export default ClubIntroducePage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('introduce/club');
  const clubList = res.data;

  return { props: { clubList } };
}
