import { ReservationProvider } from "../contexts/ReservationProvider";
import ReservationTimeTracker from "./ReservationTimeTracker";
import ReservationStage from "./stage/ReservationStage";
import ReservationSidebar from "./sidebar/ReservationSidebar";
import { getBlockGrades, getGradeInfo } from "@/services/venue";
import ReservationHeader from "./header/ReservationHeader";
import Captcha from "./Captcha";

interface ReservationProps {
  searchParams: Promise<{ sId?: string }>;
}

export default async function Reservation({ searchParams }: ReservationProps) {
  const { sId } = await searchParams;

  if (!sId) {
    throw new Error("INVALID_ACCESS");
  }

  const sessionId = parseInt(sId, 10);

  if (isNaN(sessionId)) {
    throw new Error("INVALID_ACCESS");
  }

  const [blockGrades, grades] = await Promise.all([
    getBlockGrades(sessionId),
    getGradeInfo(sessionId),
  ]);

  return (
    <ReservationProvider blockGrades={blockGrades} grades={grades}>
      <ReservationTimeTracker />
      <Captcha />
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
