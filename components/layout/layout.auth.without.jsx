import Head from 'next/head';
import React from 'react';
import styled from 'styled-components';

const LayoutWithoutAuth = ({ children }) => {
  return (
    <div>
      <Head>
        <title>POPO 관리자페이지</title>
        <meta name="description" content="POPO 관리자 페이지" />
        <meta name="robots" content="noindex,nofollow" />
        <link rel="icon" href={'/favicon.ico'} />
      </Head>
      <main>
        <Wrapper>{children}</Wrapper>
      </main>
    </div>
  );
};

const Wrapper = styled.div`
  height: 100%;
  min-height: calc(100vh - ${({ theme }) => theme.footerHeight});
  max-width: ${({ theme }) => theme.contentWidth};
  padding: 8rem 1rem 2rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export default LayoutWithoutAuth;
