"use client";

import { useReservation } from "../../contexts/ReservationProvider";
import { gradeInfoColor } from "../../data/seat";

export default function SelectedSeatsList() {
  const { selectedSeats, handleRemoveSeat, grades } = useReservation();

  if (selectedSeats.size === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">
        좌석을 선택해주세요
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from(selectedSeats).map(([key, seat]) => (
        <div
          key={key}
          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <div
                className={`text-sm ${
                  gradeInfoColor[seat.seatGrade.id].textColor
                }`}
              >
                {seat.seatGrade.name}
              </div>
              <div className="text-xs text-gray-500">
                {seat.blockNum}구역 {seat.rowNum} {seat.seatNum} 번
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
      ))}
    </div>
  );
}
