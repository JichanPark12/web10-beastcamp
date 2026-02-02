"use client";

import { Seat } from "../../../types/reservationType";
import SeatButton from "./SeatButton";

interface SeatRowProps {
  rowNum: string;
  seats: Seat[];
  selectedSeats: ReadonlyMap<string, Seat>;
  gradeColor: string;
  onToggle: (seatId: string, seat: Seat) => void;
}

export default function SeatRow({
  rowNum,
  seats,
  selectedSeats,
  gradeColor,
  onToggle,
}: SeatRowProps) {
  return (
    <div className="flex gap-4 items-center p-1">
      <div className="w-8 text-right text-gray-400 font-bold text-xs">
        {rowNum}열
      </div>
      <div className="flex gap-1.5">
        {seats.map((seat) => (
          <SeatButton
            key={seat.id}
            seat={seat}
            isSelected={selectedSeats.has(seat.id)}
            gradeColor={gradeColor}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
