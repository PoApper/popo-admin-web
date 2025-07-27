import React, { useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import styled, { ThemeProvider } from 'styled-components';

import theme from '../../styles/theme';
import { PoPoAxios } from '@/utils/axios.instance';
import Navbar from '../navbar/navbar';

const LayoutWithAuth = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    PoPoAxios.get('/auth/verifyToken/admin').catch(() => {
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
          <Navbar />
          <Wrapper>
            <div style={{ width: '100%' }}>{children}</div>
          </Wrapper>
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
