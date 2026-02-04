"use client";

import { RESERVATION_LIMIT } from "@/app/reservations/_source/constants/reservationConstants";
import { useReservation } from "../../contexts/NolReservationProvider";

export default function NolSelectedSeatCount() {
  const { selectedSeats } = useReservation();

  return (
    <div className="text-sm text-gray-500">
      선택: {selectedSeats.size}/{RESERVATION_LIMIT}석
    </div>
  );
}
