import LayoutWithAuth from '../layout/layout.auth.with';
import BoardMenubar from './board.menubar';

const BoardLayout = ({ children }) => {
  return (
    <LayoutWithAuth>
      <h2>게시물 관리</h2>
      <BoardMenubar />
      {children}
    </LayoutWithAuth>
  );
};

export default BoardLayout;
