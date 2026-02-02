"use client";

import { Seat } from "../../../types/reservationType";
import { getSeatButtonStyle } from "../../../utils/seatUtils";

interface SeatButtonProps {
  seat: Seat;
  isSelected: boolean;
  gradeColor: string;
  onToggle: (seatId: string, seat: Seat) => void;
}

export default function SeatButton({
  seat,
  isSelected,
  gradeColor,
  onToggle,
}: SeatButtonProps) {
  const { isReserved } = seat;
  const buttonStyle = getSeatButtonStyle(!!isReserved, isSelected);

  return (
    <button
      disabled={isReserved}
      onClick={() => onToggle(seat.id, seat)}
      className={`w-6 h-6 rounded-md text-[10px] font-medium flex items-center justify-center text-white ${buttonStyle}`}
      style={{
        backgroundColor: isReserved ? "#d1d5db" : gradeColor,
      }}
      title={`${seat.rowNum}열 ${seat.colNum}번${
        isReserved ? " (예약됨)" : ""
      }`}
    ></button>
  );
}
