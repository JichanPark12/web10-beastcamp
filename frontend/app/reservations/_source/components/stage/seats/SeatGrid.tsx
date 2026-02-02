"use client";

import { Seat } from "../../../types/reservationType";
import SeatRow from "./SeatRow";

interface RowData {
  rowNum: string;
  seats: Seat[];
}

interface SeatGridProps {
  rows: RowData[];
  selectedSeats: ReadonlyMap<string, Seat>;
  gradeColor: string;
  onToggle: (seatId: string, seat: Seat) => void;
}

export default function SeatGrid({
  rows,
  selectedSeats,
  gradeColor,
  onToggle,
}: SeatGridProps) {
  return (
    <div className="flex flex-col gap-3 items-center min-w-max mx-auto">
      <div className="w-full max-w-lg text-center py-1.5 mb-6 bg-gray-200/50 text-gray-400 text-xs font-bold rounded tracking-widest uppercase">
        Stage
      </div>

      {rows.map(({ rowNum, seats }) => (
        <SeatRow
          key={rowNum}
          rowNum={rowNum}
          seats={seats}
          selectedSeats={selectedSeats}
          gradeColor={gradeColor}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
