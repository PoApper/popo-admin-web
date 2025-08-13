import styled from 'styled-components';
import { Dropdown, Image, Menu } from 'semantic-ui-react';
import Link from 'next/link';
import MenuItemUser from './menu.item.user';

const Navbar = () => {
  return (
    <>
      <NavbarWrapper>
        <MobileDiv>
          <MobileNav />
        </MobileDiv>
        <DesktopDiv>
          <DesktopNav />
        </DesktopDiv>
      </NavbarWrapper>
    </>
  );
};

export default Navbar;

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

const MobileDiv = styled.div`
  @media only screen and (min-width: 800px) {
    display: none;
  }
`;

const DesktopDiv = styled.span`
  @media only screen and (max-width: 768px) {
    display: none;
  }
`;

const MobileNav = () => {
  return (
    <>
      <div
        style={{
          backgroundColor: 'black',
          textAlign: 'center',
          color: 'white',
        }}
      >
        관리자
      </div>
      <NavbarInner>
        <NavbarMenu borderless>
          <Menu.Item style={{ margin: 10 }}>
            <Dropdown icon={'sidebar'} style={{ margin: '0' }}>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <Link
                    href={'/reservation'}
                    passHref
                    style={{ color: 'black' }}
                  >
                    예약 관리
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link href={'/introduce'} passHref style={{ color: 'black' }}>
                    소개글 관리
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link href={'/board'} passHref style={{ color: 'black' }}>
                    게시물 관리
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link href={'/paxi'} passHref style={{ color: 'black' }}>
                    카풀 관리
                  </Link>
                </Dropdown.Item>
                <Dropdown.Item>
                  <Link
                    href={'/statistics'}
                    passHref
                    style={{ color: 'black' }}
                  >
                    통계 보기
                  </Link>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Item>

          <Menu.Item position={'left'} style={{ paddingLeft: 0 }}>
            <Link href={'/'} passHref>
              <Image
                src={'/popo.svg'}
                alt={'logo'}
                size={'tiny'}
                style={{ margin: 'rgba(255, 255, 255, 0.7)' }}
              />
            </Link>
          </Menu.Item>

          <MenuItemUser />
        </NavbarMenu>
      </NavbarInner>
    </>
  );
};

const DesktopNav = () => {
  return (
    <NavbarInner>
      <NavbarMenu borderless>
        <Link href={'/'} passHref>
          <Menu.Item position={'left'} style={{ paddingLeft: 0 }}>
            <span style={{ textAlign: 'center' }}>
              <Image centered src={'/popo.svg'} alt={'logo'} size={'small'} />
            </span>
            관리자
          </Menu.Item>
        </Link>
        <Menu.Item>
          <Link href={'/user'} passHref style={{ color: 'black' }}>
            유저 관리
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={'/reservation'} passHref style={{ color: 'black' }}>
            예약 관리
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={'/introduce'} passHref style={{ color: 'black' }}>
            소개글 관리
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={'/board'} passHref style={{ color: 'black' }}>
            게시물 관리
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={'/paxi'} passHref style={{ color: 'black' }}>
            카풀 관리
          </Link>
        </Menu.Item>
        <Menu.Item>
          <Link href={'/statistics'} passHref style={{ color: 'black' }}>
            통계 보기
          </Link>
        </Menu.Item>
        <MenuItemUser />
      </NavbarMenu>
    </NavbarInner>
  );
};
