import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { ThemeProvider } from 'styled-components';
import MediaQuery from 'react-responsive';

import theme from '../../styles/theme';
import { PoPoAxios } from '@/utils/axios.instance';
import NavbarDesktop from '../navbar/navbar.desktop';
import NavbarMobile from '../navbar/navbar.mobile';
import SideBar from '../navbar/sidebar';

const LayoutWithAuth = ({ children }) => {
  const router = useRouter();
  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_ENV === 'local') return;
    PoPoAxios.get('/auth/verifyToken', {
      withCredentials: true,
    }).catch(() => {
      router.push('/login');
    });
  }, [router]);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>POPO 관리자페이지</title>
        <meta name="description" content="POPO 관리자 페이지" />
        <link rel="icon" href={'/favicon.ico'} />
      </Head>
      <>
        <main>
          <MediaQuery maxWidth={768}>
            <NavbarMobile openSidebar={() => setSidebarVisible(true)} />
            <SideBar
              visible={sidebarVisible}
              toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
              pushContent={
                <Wrapper>
                  <div style={{ width: '100%' }}>{children}</div>
                </Wrapper>
              }
            />
          </MediaQuery>

          <MediaQuery minWidth={768}>
            <NavbarDesktop />
            <Wrapper>
              <div style={{ width: '100%' }}>{children}</div>
            </Wrapper>
          </MediaQuery>
        </main>
      </>
    </ThemeProvider>
  );
};

const Wrapper = styled.div`
  height: 100%;
  min-height: calc(100vh);
  max-width: ${({ theme }) => theme.contentWidth};
  padding: 8rem 1rem 2rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default LayoutWithAuth;
