"use client";

import {
  useReservationState,
  useReservationDispatch,
  useReservationData,
} from "../../contexts/ReservationProvider";
import { gradeInfoColor } from "../../data/seat";

export default function SelectedSeatsList() {
  const { venue } = useReservationData();
  const { selectedSeats } = useReservationState();
  const { handleRemoveSeat } = useReservationDispatch();

  if (selectedSeats.size === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        좌석을 선택해주세요
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from(selectedSeats).map(([key, seat]) => {
        const targetBlock = venue?.blocks.find((b) => b.id === seat.blockNum);
        return (
          <div
            key={key}
            className="bg-gray-50 rounded-lg p-3 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div
                  className={`text-sm ${
                    gradeInfoColor[seat.seatGrade.name]?.textColor ??
                    "text-red-600"
                  }`}
                >
                  {seat.seatGrade.name}
                </div>
                <div className="text-xs text-gray-500">
                  {targetBlock?.blockDataName} {seat.rowNum} {seat.colNum} 번
                </div>
              </div>
              <button
                onClick={() => handleRemoveSeat(seat.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="text-right">
              <span className="text-sm">
                {"" + seat.seatGrade.price.toLocaleString()}원
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
