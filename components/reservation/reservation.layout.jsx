import LayoutWithAuth from '../layout/layout.auth.with';
import ReservationMenubar from './reservation.menubar';

const ReservationLayout = ({ children }) => {
  return (
    <LayoutWithAuth>
      <h2>예약 관리</h2>
      <ReservationMenubar />
      {children}
    </LayoutWithAuth>
  );
};

export default ReservationLayout;
