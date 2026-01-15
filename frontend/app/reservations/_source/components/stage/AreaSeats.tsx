"use client";

import { useReservation } from "../../contexts/ReservationProvider";
import { gradeInfoColor } from "../../data/seat";
import { Seat } from "../../types/reservationType";

export default function AreaSeats() {
  const {
    area,
    handleDeselectArea,
    selectedSeats,
    handleToggleSeat,
    venue,
    blockGrades,
    grades,
  } = useReservation();

  const targetBlock = venue?.blocks.find((b) => String(b.id) === area);
  const blockGrade = blockGrades?.find((bg) => bg.blockId === targetBlock?.id);

  if (!targetBlock) return <div>구역 정보를 찾을 수 없습니다.</div>;

  const rows = [];
  const { rowSize, colSize, blockDataName } = targetBlock;
  const gradeKey = String(blockGrade?.gradeId || "1");
  const gradeColor = gradeInfoColor[gradeKey]?.fillColor || "#374151";

  for (let r = 1; r <= rowSize; r++) {
    const seats: Seat[] = [];
    for (let c = 1; c <= colSize; c++) {
      const seatId = `${blockDataName}-${r}-${c}`;

      seats.push({
        id: seatId,
        seatGrade: grades.find((g) => g.id + "" === gradeKey) || grades[0],
        rowNum: r + "",
        seatNum: c + "",
        blockNum: targetBlock.blockDataName,
      });
    }
    rows.push({ rowNum: String(r), seats });
  }

  return (
    <div className="h-full w-full bg-white flex flex-col rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b flex items-center justify-between bg-white z-10 sticky top-0">
        <h2 className="text-lg font-bold">
          {targetBlock.blockDataName} 구역 좌석 선택
        </h2>
        <button
          onClick={handleDeselectArea}
          className="px-3 py-1.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
        >
          지도 보기
        </button>
      </div>

      <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
        <div className="flex flex-col gap-3 items-center min-w-max mx-auto">
          <div className="w-full max-w-lg text-center py-1.5 mb-6 bg-gray-200/50 text-gray-400 text-xs font-bold rounded tracking-widest uppercase">
            Stage
          </div>

          {rows.map(({ rowNum, seats }) => (
            <div key={rowNum} className="flex gap-4 items-center p-1">
              <div className="w-8 text-right text-gray-400 font-bold text-xs">
                {rowNum}열
              </div>
              <div className="flex gap-1.5">
                {seats.map((seat) => {
                  const isSelected = selectedSeats.has(seat.id);

                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleToggleSeat(seat.id, seat)}
                      className={`w-6 h-6 rounded-md text-[10px] font-medium flex items-center justify-center text-white ${
                        isSelected
                          ? "z-10 border-2 border-gray-900"
                          : "hover:opacity-80"
                      }`}
                      style={{ backgroundColor: gradeColor }}
                      title={`${seat.rowNum}열 ${seat.seatNum}번`}
                    ></button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
