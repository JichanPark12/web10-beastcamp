"use client";

import { useReservation } from "../../contexts/ReservationProvider";

export default function SidebarHeader() {
  const { selectedSeats, handleResetSeats } = useReservation();

  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-lg">선택 좌석 {selectedSeats.size}</h3>
      <button
        onClick={handleResetSeats}
        className="text-sm text-gray-500 hover:text-gray-700"
        disabled={selectedSeats.size === 0}
      >
        전체삭제
      </button>
    </div>
  );
}
