import { ReservationProvider } from "../contexts/ReservationProvider";
import ReservationHeader from "./ReservationHeader";
import ReservationTimeTracker from "./ReservationTimeTracker";
import ReservationStage from "./stage/ReservationStage";
import ReservationSidebar from "./sidebar/ReservationSidebar";

export default function Reservation() {
  return (
    <ReservationProvider>
      <ReservationTimeTracker />
      <div className="h-screen flex flex-col overflow-hidden">
        <ReservationHeader />
        <div className="flex-1 flex overflow-hidden min-h-0">
          <ReservationStage />
          <ReservationSidebar />
        </div>
      </div>
    </ReservationProvider>
  );
}
