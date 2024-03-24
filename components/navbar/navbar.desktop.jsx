import styled from 'styled-components';
import { Image, Menu } from 'semantic-ui-react';
import Link from 'next/link';
import MenuItemUser from './menu.item.user';

const NavbarDesktop = () => {
  return (
    <>
      <NavbarWrapper>
        <NavbarInner>
          <NavbarMenu borderless>
            <Link href={'/'} passHref>
              <Menu.Item position={'left'} style={{ paddingLeft: 0 }}>
                <span style={{ textAlign: 'center' }}>
                  <Image
                    centered
                    src={'/popo.svg'}
                    alt={'logo'}
                    size={'small'}
                  />
                </span>
                관리자
              </Menu.Item>
            </Link>
            <Link href={'/user'} passHref>
              <Menu.Item link>유저 관리</Menu.Item>
            </Link>
            <Link href={'/reservation'} passHref>
              <Menu.Item link>예약 관리</Menu.Item>
            </Link>
            <Link href={'/introduce'} passHref>
              <Menu.Item link>소개글 관리</Menu.Item>
            </Link>
            <Link href={'/board'} passHref>
              <Menu.Item link>게시물 관리</Menu.Item>
            </Link>
            <Link href={'/statistics'} passHref>
              <Menu.Item link>통계 보기</Menu.Item>
            </Link>

            <MenuItemUser />
          </NavbarMenu>
        </NavbarInner>
      </NavbarWrapper>
    </>
  );
};

export default NavbarDesktop;

const NavbarWrapper = styled.nav`
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;

  font-weight: bold;
  width: 100%;

  position: fixed;
  top: 0;
  z-index: 10;
`;

const NavbarInner = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: auto;

  max-width: ${({ theme }) => theme.contentWidth};
`;

const NavbarMenu = styled(Menu)`
  box-shadow: none !important;
  border: none !important;
  width: 100%;
`;
