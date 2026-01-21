"use client";

import { useReservationState } from "../../contexts/ReservationProvider";
import { RESERVATION_LIMIT } from "../../constants/reservationConstants";

export default function SelectedSeatCount() {
  const { selectedSeats } = useReservationState();

  return (
    <div className="text-sm text-gray-500">
      선택: {selectedSeats.size}/{RESERVATION_LIMIT}석
    </div>
  );
}
