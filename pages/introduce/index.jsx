import { PoPoAxios } from '@/utils/axios.instance';
import IntroduceLayout from '@/components/introduce/introduce.layout';
import AssociationTable from '@/components/introduce/association.table';
import ClubTable from '@/components/introduce/club.table';
import StudentAssociationTable from '@/components/introduce/student_association.table';

const IntroducePage = ({
  associationList,
  clubList,
  studentAssociationList,
}) => {
  return (
    <IntroduceLayout>
      <p>현재 영문 소개글을 지원하기 위해 개발하고 있습니다 👨‍💻</p>

      <h2>오늘 조회된 자치단체 소개글</h2>
      <div>
        <AssociationTable associations={associationList} />
      </div>

      <h2>오늘 조회된 동아리 소개글</h2>
      <div>
        <ClubTable clubs={clubList} />
      </div>

      <h2>오늘 조회된 학생단체 소개글</h2>
      <div>
        <StudentAssociationTable studentAssociations={studentAssociationList} />
      </div>
    </IntroduceLayout>
  );
};

export default IntroducePage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('introduce/association/today');
  const associationList = res1.data;

  const res2 = await PoPoAxios.get('introduce/club/today');
  const clubList = res2.data;

  const res3 = await PoPoAxios.get('introduce/student_association/today');
  const studentAssociationList = res3.data;

  return { props: { associationList, clubList, studentAssociationList } };
}
