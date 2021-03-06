import LayoutMain from '../components/layout.main'
import { Divider, Grid, Image, List } from 'semantic-ui-react'

const HomePage = () => {
  return (
    <LayoutMain>
      <Grid columns="equal" stackable>
        <Grid.Column>
          <h2>POPO 관리자 페이지🎩</h2>
          <p style={{ fontSize: '16px', marginBottom: '2rem' }}>
            안녕하세요, POPO의 관리자 페이지입니다.
            이곳에서 POPO 사이트의 기능과 데이터베이스를 관리할 수 있습니다.
            POPO 서비스가 지속되기 위해선 관리자 여러분의 노력이 필요합니다. 🙏
            <br/><br/>
            현재 POPO의 유지/보수는 동아리 PoApper가 진행하고 있습니다. 서비스 장애시 PoApper에 문의 부탁드립니다
            👨‍💻
          </p>
          <Divider/>
          <h2>ToDo List 🚀</h2>
          <List as="ul">
            <List.Item as="li">게시판 기능</List.Item>
            <List.Item as="li">PoApper SSO 유저 정보 이전</List.Item>
            <List.Item as="li">Full Responsive Web</List.Item>
          </List>
        </Grid.Column>
        <Grid.Column>
          <Image
            centered rounded
            size={'medium'}
            src={'/home_background.jpg'}
            alt={'home_background'}
          />
        </Grid.Column>
      </Grid>

    </LayoutMain>
  )
}

export default HomePage