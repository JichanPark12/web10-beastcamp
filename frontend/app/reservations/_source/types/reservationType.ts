// 좌석 정보 타입
export interface Seat {
  seatInfoId: string;
  seatGrade: Grade;
  seatGradeName: string;
  floor: string;
  rowNo: string;
  seatNo: string;
  salesPrice: number;
  posLeft: number;
  posTop: number;
  isExposable: boolean;
}

export type Grade = "1" | "2" | "3" | "4" | "5";

export interface SeatBlock {
  blockKey: string;
  seats: Seat[];
}

export interface SeatStatus {
  seatInfoId: string;
  statusInfo: "OCCUPIED" | "RELEASED";
}

export interface SeatReservation {
  blockKey: string;
  seats: SeatStatus[];
}

export interface BlockArea {
  blockKey: string;
  selfDefineBlock: string;
  absoluteLeft: number;
  absoluteTop: number;
  absoluteRight: number;
  absoluteBottom: number;
}

export interface CombinedSeat extends Seat {
  statusInfo?: "OCCUPIED" | "AVAILABLE" | "SELECTED";
}

export interface CombinedSeatBlock {
  blockKey: string;
  blockArea?: BlockArea;
  seats: CombinedSeat[];
}

export type SeatDataResponse = SeatBlock[];

export type ReservationResponse = SeatReservation[];
export type BlockDataResponse = BlockArea[];
