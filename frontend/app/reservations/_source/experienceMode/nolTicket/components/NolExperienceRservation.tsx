import Captcha from "../../../components/Captcha";
import { ReservationProvider } from "../../../contexts/ReservationProvider";
import { NolReservationProvider } from "../contexts/NolReservationProvider";
import NolReservationHeader from "./header/NolReservationHeader";
import NolReservationStage from "./NolReservationStage";
import NolSidebar from "./sidebar/NolSidebar";

interface ReservationProps {
  searchParams: Promise<{ sId?: string }>;
}

export default async function NolExperienceRservation({
  searchParams,
}: ReservationProps) {
  const { sId } = await searchParams;

  if (!sId) {
    throw new Error("INVALID_ACCESS");
  }

  return (
    <ReservationProvider blockGrades={[]} grades={[]}>
      <NolReservationProvider>
        <Captcha />
        <div className="fixed top-[82px] inset-0  bg-white flex flex-col">
          <NolReservationHeader />
          <div className="flex-1 flex overflow-hidden min-h-0 relative">
            <NolReservationStage />
            <NolSidebar />
          </div>
        </div>
      </NolReservationProvider>
    </ReservationProvider>
  );
}
