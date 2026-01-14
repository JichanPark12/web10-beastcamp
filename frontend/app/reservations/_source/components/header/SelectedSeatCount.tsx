"use client";

import { useReservation } from "../../contexts/ReservationProvider";
import { RESERVATION_LIMIT } from "../../constants/reservationConstants";

export default function SelectedSeatCount() {
  const { selectedSeats } = useReservation();

  return (
    <div className="text-sm text-gray-500">
      선택: {selectedSeats.size}/{RESERVATION_LIMIT}석
    </div>
  );
}
