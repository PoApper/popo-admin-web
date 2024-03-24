import Link from 'next/link';
import { Button, Image } from 'semantic-ui-react';
import LayoutWithoutAuth from '@/components/layout/layout.auth.without';

const ErrorPage = () => {
  return (
    <LayoutWithoutAuth>
      <Image src={'/popo.svg'} alt={'popo_logo'} />
      <h2>잘못된 주소이거나 현재 개발중인 페이지 입니다 🙏</h2>
      <Link href={'/'} passHref>
        <Button>홈으로 이동</Button>
      </Link>
    </LayoutWithoutAuth>
  );
};

export default ErrorPage;
