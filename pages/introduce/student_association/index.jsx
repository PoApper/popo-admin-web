import React from 'react';
import Link from 'next/link';
import { Button } from 'semantic-ui-react';

import IntroduceLayout from '@/components/introduce/introduce.layout';
import StudentAssociationTable from '@/components/introduce/student_association.table';
import { PoPoAxios } from '@/utils/axios.instance';

const StudentAssociationIntroducePage = ({ studentAssociationList }) => {
  return (
    <IntroduceLayout>
      <h3>학생단체 소개글</h3>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={'/introduce/student_association/create'}>
          <Button>학생단체 생성</Button>
        </Link>
      </div>
      <div>
        <StudentAssociationTable studentAssociations={studentAssociationList} />
      </div>
    </IntroduceLayout>
  );
};

export default StudentAssociationIntroducePage;

export async function getServerSideProps() {
  const res = await PoPoAxios.get('introduce/student_association');
  const studentAssociationList = res.data;

  return { props: { studentAssociationList } };
}
