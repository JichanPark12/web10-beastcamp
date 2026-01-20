import { ReservationProvider } from "../contexts/ReservationProvider";
import ReservationTimeTracker from "./ReservationTimeTracker";
import ReservationStage from "./stage/ReservationStage";
import ReservationSidebar from "./sidebar/ReservationSidebar";
import { getBlockGrades, getGradeInfo } from "@/services/venue";
import AlertAndRedirect from "./AlertAndRedirect";
import ReservationHeader from "./header/ReservationHeader";

interface ReservationProps {
  searchParams: Promise<{ sId?: string }>;
}

export default async function Reservation({ searchParams }: ReservationProps) {
  const { sId } = await searchParams;

  // sessionId가 없으면 정상적이지 않은 접근이므로 메인으로 리다이렉트 시킵니다.
  if (!sId) {
    return <AlertAndRedirect message="정상적이지 않은 접근입니다." to="/" />;
  }

  const sessionId = parseInt(sId, 10);

  const [blockGrades, grades] = await Promise.all([
    getBlockGrades(sessionId),
    getGradeInfo(sessionId),
  ]);

  return (
    <ReservationProvider blockGrades={blockGrades} grades={grades}>
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
