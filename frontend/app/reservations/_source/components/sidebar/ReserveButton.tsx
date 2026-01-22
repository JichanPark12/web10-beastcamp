"use client";

import {
  useReservationState,
  useReservationDispatch,
  useReservationData,
} from "../../contexts/ReservationProvider";

export default function ReserveButton() {
  const { selectedSeats } = useReservationState();
  const { session } = useReservationData();
  const { handleClickReserve } = useReservationDispatch();

  return (
    <button
      onClick={() => handleClickReserve(+session.id)}
      disabled={selectedSeats.size === 0}
      className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
    >
      선택 완료
    </button>
  );
}
