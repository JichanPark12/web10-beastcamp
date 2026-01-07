import { gradeInfo } from "../../data/seat";
import { Seat } from "../../types/reservationType";

interface ReservationSidebarProps {
  selectedSeats: ReadonlyMap<string, Seat>;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
  handleRemoveSeat: (seatId: string) => void;
}

export default function ReservationSidebar({
  selectedSeats,
  handleResetSeats,
  handleClickReserve,
  handleRemoveSeat,
}: ReservationSidebarProps) {
  const totalPrice = Array.from(selectedSeats.values()).reduce(
    (sum, seat) => sum + seat.price,
    0
  );
  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
      {/* Seat Grade & Price Info */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
        <h4 className="text-sm mb-3">좌석 등급 & 가격</h4>
        <div className="space-y-2">
          {Object.entries(gradeInfo).map(([key, info]) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: info.fillColor }}
                ></div>
                <span className="text-sm text-gray-700">{info.name}</span>
              </div>
              <span className="text-sm text-gray-600">
                {info.price.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">선택 좌석 {selectedSeats.size}</h3>
        <button
          onClick={handleResetSeats}
          className="text-sm text-gray-500 hover:text-gray-700"
          disabled={selectedSeats.size === 0}
        >
          전체삭제
        </button>
      </div>

      {/* Selected Seats List */}
      <div className="space-y-3 mb-6">
        {selectedSeats.size === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            좌석을 선택해주세요
          </div>
        ) : (
          Array.from(selectedSeats).map(([key, seat]) => (
            <div
              key={key}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className={`text-sm ${gradeInfo[seat.grade].textColor}`}>
                    {gradeInfo[seat.grade].name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {seat.floor} {seat.section} {seat.row}열 {seat.number}번
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
                <span className="text-sm">{seat.price.toLocaleString()}원</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Price Summary */}
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

      {/* Confirm Button */}
      <button
        onClick={handleClickReserve}
        disabled={selectedSeats.size === 0}
        className="w-full py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
      >
        선택 완료
      </button>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800">
          ⏰ 좌석 선택 후 5분 이내에 결제를 완료해주세요
        </p>
      </div>
    </div>
  );
}
