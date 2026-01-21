import SeatGradeInfo from "./SeatGradeInfo";
import SidebarHeader from "./SidebarHeader";
import SelectedSeatsList from "./SelectedSeatsList";
import PriceSummary from "./PriceSummary";
import ReserveButton from "./ReserveButton";
import ReservationTip from "./ReservationTip";

export default function ReservationSidebar() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
      <SeatGradeInfo />
      <SidebarHeader />
      <div className="mb-6">
        <SelectedSeatsList />
      </div>
      <PriceSummary />
      <ReserveButton />
      <ReservationTip />
    </div>
  );
}
