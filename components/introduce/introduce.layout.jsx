import LayoutWithAuth from '../layout/layout.auth.with';
import IntroduceMenubar from './introduce.menubar';

const IntroduceLayout = ({ children }) => {
  return (
    <LayoutWithAuth>
      <h2>소개글 관리</h2>
      <IntroduceMenubar />
      {children}
    </LayoutWithAuth>
  );
};

export default IntroduceLayout;
