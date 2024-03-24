import React from 'react';
import Link from 'next/link';
import { Button, Message } from 'semantic-ui-react';

import { PoPoAxios } from '@/utils/axios.instance';
import BoardLayout from '@/components/board/board.layout';
import AffiliateTable from '@/components/board/benefit/affiliate/affiliate.table';
import DiscountTable from '@/components/board/benefit/discount/discount.table';

const BenefitPage = ({ affiliateList, discountList }) => {
  return (
    <BoardLayout>
      <h3>총학 혜택 목록</h3>

      <Message>
        총학 제휴/할일 업체 목록은 이름 순으로 정렬되어 표시 됩니다.
      </Message>

      <h4>총학 제휴 업체</h4>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={'/board/benefit/affiliate/create'}>
          <Button>제휴 업체 등록</Button>
        </Link>
      </div>
      <div>
        <AffiliateTable affiliateList={affiliateList} />
      </div>

      <h4>총학 할인 업체</h4>
      <div style={{ marginBottom: '1rem' }}>
        <Link href={'/board/benefit/discount/create'}>
          <Button>할인 업체 등록</Button>
        </Link>
      </div>
      <div>
        <DiscountTable discountList={discountList} />
      </div>
    </BoardLayout>
  );
};

export default BenefitPage;

export async function getServerSideProps() {
  const res1 = await PoPoAxios.get('benefit/affiliate');
  const affiliateList = res1.data;

  const res2 = await PoPoAxios.get('benefit/discount');
  const discountList = res2.data;

  return { props: { affiliateList, discountList } };
}
