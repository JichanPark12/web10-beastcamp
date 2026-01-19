export type SeatGrade = "VIP" | "R" | "S" | "A" | "GENERAL";

export interface Seat {
  seatInfoId: string;
  seatGrade: SeatGrade;
  seatGradeName: string;
  floor: string;
  rowNo: string;
  seatNo: string;
  salesPrice: number;
  posLeft: number;
  posTop: number;
  isExposable: boolean;
}
