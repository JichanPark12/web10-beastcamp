"use client";

import {
  useReservationState,
  useReservationData,
} from "../../contexts/ReservationProvider";
import { useReservationTicket } from "../../hooks/useReservationTicket";

export default function ReserveButton() {
  const { selectedSeats } = useReservationState();
  const { session } = useReservationData();
  const { reserve, isReserving } = useReservationTicket();

  return (
    <button
      onClick={() => reserve(+session.id, selectedSeats)}
      disabled={selectedSeats.size === 0 || isReserving}
      className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      {isReserving ? "예매 처리중입니다" : "선택 완료"}
    </button>
  );
}
