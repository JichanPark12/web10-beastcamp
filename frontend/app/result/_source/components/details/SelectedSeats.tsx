"use client";

import { CheckCircle } from "lucide-react";
import { useResultQuery } from "../../queries/result";

export default function SelectedSeats() {
  const { data: seats } = useResultQuery();

  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
      <p className="text-green-800 mb-3">성공적으로 티켓을 예매했습니다!</p>

      {seats.map((seat) => (
        <div
          key={seat.seatInfoId}
          className="flex justify-center items-center text-sm"
        >
          <span className="text-gray-600">
            {seat.seatGradeName} {seat.rowNo} {seat.seatNo}번
          </span>
        </div>
      ))}
    </div>
  );
}
