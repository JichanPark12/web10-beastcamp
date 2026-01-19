import { ReservationProvider } from "../contexts/ReservationProvider";
import ReservationHeader from "./ReservationHeader";
import ReservationTimeTracker from "./ReservationTimeTracker";
import ReservationStage from "./stage/ReservationStage";
import ReservationSidebar from "./sidebar/ReservationSidebar";
import { getLatestPerformance, getSessions } from "@/services/performance";
import { getBlockGrades, getGradeInfo, getVenue } from "@/services/venue";

export default async function Reservation() {
  const performance = await getLatestPerformance();
  const sessions = await getSessions(performance.performance_id);
  const venue = await getVenue(sessions[0].venueId);

  const [blockGrades, grades] = await Promise.all([
    getBlockGrades(sessions[0].id),
    getGradeInfo(sessions[0].id),
  ]);

  return (
    <ReservationProvider
      venue={venue}
      performance={performance}
      sessions={sessions}
      blockGrades={blockGrades}
      grades={grades}
    >
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
