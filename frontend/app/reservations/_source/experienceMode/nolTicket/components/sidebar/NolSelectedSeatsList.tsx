"use client";

import { useReservation } from "../../contexts/NolReservationProvider";
import { nolGradeInfo } from "@/app/reservations/_source/data/seat";

export default function NolSelectedSeatsList() {
  const { selectedSeats, handleRemoveSeat } = useReservation();

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
                  nolGradeInfo[seat.seatGrade]?.textColor ?? "text-gray-600"
                }`}
              >
                {seat.seatGradeName}
              </div>
              <div className="text-xs text-gray-500">
                {seat.floor}층 {seat.rowNo} {seat.seatNo}
              </div>
            </div>
            <button
              onClick={() => handleRemoveSeat(seat.seatInfoId)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          <div className="text-right">
            <span className="text-sm">
              {seat.salesPrice.toLocaleString()}원
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
