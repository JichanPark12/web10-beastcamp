// 좌석 정보 타입

import { Grade } from "@/types/venue";

// 우리 서버 데이터 타입

export interface Seat {
  id: string;
  seatGrade: Grade;
  rowNum: number;
  colNum: number;
  blockNum: number;
  isReserved?: boolean;
}

// nol mock 타입

export interface NolSeat {
  seatInfoId: string;
  seatGrade: NolGrade;
  seatGradeName: string;
  floor: string;
  rowNo: string;
  seatNo: string;
  salesPrice: number;
  posLeft: number;
  posTop: number;
  isExposable: boolean;
}

export type NolGrade = "1" | "2" | "3" | "4" | "5";

export interface NolSeatBlock {
  blockKey: string;
  seats: NolSeat[];
}

export interface NolSeatStatus {
  seatInfoId: string;
  statusInfo: "OCCUPIED" | "RELEASED";
}

export interface NolSeatReservation {
  blockKey: string;
  seats: NolSeatStatus[];
}

export interface NolBlockArea {
  blockKey: string;
  selfDefineBlock: string;
  absoluteLeft: number;
  absoluteTop: number;
  absoluteRight: number;
  absoluteBottom: number;
}

export interface NolCombinedSeat extends NolSeat {
  statusInfo?: "OCCUPIED" | "AVAILABLE" | "SELECTED";
}

export interface NolCombinedSeatBlock {
  blockKey: string;
  blockArea?: NolBlockArea;
  seats: NolCombinedSeat[];
}

export type NolSeatDataResponse = NolSeatBlock[];

export type NolReservationResponse = NolSeatReservation[];
export type NolBlockDataResponse = NolBlockArea[];
