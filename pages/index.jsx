import { Divider, Grid, Image, List, Button } from 'semantic-ui-react';
import LayoutWithAuth from '@/components/layout/layout.auth.with';

const HomePage = () => {
  return (
    <LayoutWithAuth>
      <Grid columns="equal" stackable>
        <Grid.Column>
          <h2>POPO 관리자 페이지🎩</h2>
          <p style={{ fontSize: '16px', marginBottom: '2rem' }}>
            안녕하세요, POPO의 관리자 페이지입니다. 이곳에서 POPO 사이트의
            기능과 데이터베이스를 관리할 수 있습니다. POPO 서비스가 지속되기
            위해선 관리자 여러분의 노력이 필요합니다. 🙏
          </p>
          <p>
            현재 POPO의 유지/보수는 동아리 PoApper가 진행하고 있습니다. 서비스
            장애시 PoApper에 문의 부탁드립니다 👨‍💻
          </p>
          <p>
            리뉴얼 이전 &nbsp;
            <a
              href="http://phome.postech.ac.kr/user/indexSub.action?codyMenuSeq=2316288&siteId=popo&menuUIType=top"
              target="_blank"
              rel="noreferrer"
            >
              (구) POPO 홈페이지
            </a>{' '}
            &nbsp; (2014 ~ 2019)
          </p>
          <Divider />
          <h2>최근 추가된 신규 기능 🚀</h2>
          <List as="ul">
            <List.Item as="li">
              생활백서 PDF 업로드 기능 추가 (2025.02.12)
            </List.Item>
            <List.Item as="li">
              POPO 앱 출시! (2025.09.28)
              <br />
              <a
                href="https://play.google.com/store/apps/details?id=com.popomobile"
                target="_blank"
                rel="noreferrer"
              >
                Google Play
              </a>
              {' | '}
              <a
                href="https://apps.apple.com/us/app/popo-%ED%8F%AC%EC%8A%A4%ED%85%8C%ED%82%A4%EC%95%88%EC%9D%98-%ED%95%84%EC%88%98-%EC%95%B1/id6743666761"
                target="_blank"
                rel="noreferrer"
              >
                App Store
              </a>
            </List.Item>
          </List>
        </Grid.Column>
        <Grid.Column>
          <Image
            centered
            rounded
            size={'medium'}
            src={'/home_background.jpg'}
            alt={'home_background'}
          />
        </Grid.Column>
      </Grid>
    </LayoutWithAuth>
  );
};

export default HomePage;
