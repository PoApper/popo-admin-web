import LayoutWithAuth from '../layout/layout.auth.with';
import PaxiMenubar from './paxi.menubar';

const PaxiLayout = ({ children }) => {
  return (
    <LayoutWithAuth>
      <h2>카풀 관리</h2>
      <PaxiMenubar />
      {children}
    </LayoutWithAuth>
  );
};

export default PaxiLayout;
