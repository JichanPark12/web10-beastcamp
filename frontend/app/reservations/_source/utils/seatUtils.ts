import { VenueBlock, Grade } from "@/types/venue";
import { Seat } from "../types/reservationType";
import { API_INDEX_ADJUSTMENT } from "../constants/reservationConstants";
import { gradeInfoColor } from "../data/seat";

interface SeatData {
  seats: boolean[][];
}

export function getSeatRows(
  block: VenueBlock | undefined,
  blockGrade: { grade: Grade } | undefined,
  grades: Grade[],
  reservationData: SeatData | undefined,
) {
  if (!block) return [];

  const { rowSize, colSize, blockDataName } = block;
  const grade = blockGrade?.grade;
  const rows = [];

  for (let r = 1; r <= rowSize; r++) {
    const seats: Seat[] = [];
    for (let c = 1; c <= colSize; c++) {
      const seatId = `${blockDataName}-${r}-${c}`;
      const isReserved =
        reservationData?.seats?.[r + API_INDEX_ADJUSTMENT]?.[
          c + API_INDEX_ADJUSTMENT
        ] ?? false;

      seats.push({
        id: seatId,
        seatGrade: grade || grades[0],
        rowNum: r,
        colNum: c,
        blockNum: block.id,
        isReserved,
      });
    }
    rows.push({ rowNum: String(r), seats });
  }
  return rows;
}

export function getSeatButtonStyle(isReserved: boolean, isSelected: boolean) {
  if (isReserved) return "bg-gray-300 cursor-not-allowed";
  if (isSelected) return "z-10 border-2 border-gray-900";
  return "hover:opacity-80";
}

export function getGradeColor(gradeName: string | undefined): string {
  return gradeInfoColor[gradeName || ""]?.fillColor || "#374151";
}
