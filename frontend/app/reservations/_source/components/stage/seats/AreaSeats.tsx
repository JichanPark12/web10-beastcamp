"use client";

import { useSearchParams } from "next/navigation";

import {
  useReservationData,
  useReservationState,
  useReservationDispatch,
} from "../../../contexts/ReservationProvider";
import { getSeatRows, getGradeColor } from "../../../utils/seatUtils";
import { useReservationSync } from "../../../hooks/useReservationSync";
import AreaHeader from "./AreaHeader";
import SeatGrid from "./SeatGrid";

export default function AreaSeats() {
  const searchParams = useSearchParams();
  const sessionId = Number(searchParams.get("sId"));

  const { venue, blockGrades, grades } = useReservationData();
  const { area, selectedSeats } = useReservationState();
  const { handleDeselectArea, handleToggleSeat } = useReservationDispatch();

  const { reservationData, refetch } = useReservationSync(sessionId, area);

  const targetBlock = venue?.blocks.find((b) => String(b.id) === area);
  const blockGrade = blockGrades?.find((bg) => bg.blockId === targetBlock?.id);

  if (!targetBlock) return <div>구역 정보를 찾을 수 없습니다.</div>;

  const gradeColor = getGradeColor(blockGrade?.grade?.name);

  const rows = getSeatRows(targetBlock, blockGrade, grades, reservationData);

  return (
    <div className="h-full w-full bg-white flex flex-col rounded-2xl overflow-hidden shadow-sm">
      <AreaHeader
        title={targetBlock.blockDataName}
        onRefresh={() => refetch()}
        onBack={handleDeselectArea}
      />

      <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
        <SeatGrid
          rows={rows}
          selectedSeats={selectedSeats}
          gradeColor={gradeColor}
          onToggle={handleToggleSeat}
        />
      </div>
    </div>
  );
}
