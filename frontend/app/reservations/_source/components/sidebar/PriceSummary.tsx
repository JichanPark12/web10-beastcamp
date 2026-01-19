"use client";

import { useReservationState } from "../../contexts/ReservationProvider";

export default function PriceSummary() {
  const { selectedSeats } = useReservationState();

  const totalPrice = Array.from(selectedSeats.values()).reduce(
    (sum, seat) => sum + seat.seatGrade.price,
    0,
  );

  return (
    <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">공연일</span>
        <span>2025.10.11</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">시간</span>
        <span>20:00</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">매수</span>
        <span>{selectedSeats.size}매</span>
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-gray-200">
        <span className="text-gray-600">총 금액</span>
        <span className="text-xl text-purple-600">
          {totalPrice.toLocaleString()}원
        </span>
      </div>
    </div>
  );
}
