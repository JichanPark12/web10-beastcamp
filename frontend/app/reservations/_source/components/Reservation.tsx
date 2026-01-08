"use client";

import useSelection from "@/hooks/useSelector";
import { useRouter } from "next/navigation";
import { Seat } from "../types/reservationType";
import ReservationHeader from "./ReservationHeader";
import ReservationStage from "./stage/ReservationStage";
import ReservationSidebar from "./sidebar/ReservationSidebar";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";

export default function Reservation() {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, Seat>(new Map(), { max: RESERVATION_LIMIT });
  const router = useRouter();

  const handleClickReserve = () => {
    try {
      throw new Error("예매 실패");
      router.push("/result");
    } catch (e) {
      console.error(e);
      alert("예매에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <ReservationHeader selectedSeatsSize={selectedSeats.size} />
      <div className="flex-1 flex overflow-hidden min-h-0">
        <ReservationStage
          selectedSeats={selectedSeats}
          handleToggleSeat={handleToggleSeat}
        />

        <ReservationSidebar
          selectedSeats={selectedSeats}
          handleResetSeats={handleResetSeats}
          handleClickReserve={handleClickReserve}
          handleRemoveSeat={handleRemoveSeat}
        />
      </div>
    </div>
  );
}
