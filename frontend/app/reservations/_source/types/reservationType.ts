// 좌석 정보 타입

import { Grade } from "@/types/venue";

export interface Seat {
  id: string;
  seatGrade: Grade;
  rowNum: string;
  colNum: string;
  blockNum: string;
  isReserved?: boolean;
}

// nol 티켓 타입 : 더이상 안씀
// export interface Seat {
//   seatInfoId: string;
//   seatGrade: Grade;
//   seatGradeName: string;
//   floor: string;
//   rowNo: string;
//   seatNo: string;
//   salesPrice: number;
//   posLeft: number;
//   posTop: number;
//   isExposable: boolean;
// }

// export type Grade = "1" | "2" | "3" | "4" | "5";

// export interface SeatBlock {
//   blockKey: string;
//   seats: Seat[];
// }

// export interface SeatStatus {
//   seatInfoId: string;
//   statusInfo: "OCCUPIED" | "RELEASED";
// }

// export interface SeatReservation {
//   blockKey: string;
//   seats: SeatStatus[];
// }

// export interface BlockArea {
//   blockKey: string;
//   selfDefineBlock: string;
//   absoluteLeft: number;
//   absoluteTop: number;
//   absoluteRight: number;
//   absoluteBottom: number;
// }

// export interface CombinedSeat extends Seat {
//   statusInfo?: "OCCUPIED" | "AVAILABLE" | "SELECTED";
// }

// export interface CombinedSeatBlock {
//   blockKey: string;
//   blockArea?: BlockArea;
//   seats: CombinedSeat[];
// }

// export type SeatDataResponse = SeatBlock[];

// export type ReservationResponse = SeatReservation[];
// export type BlockDataResponse = BlockArea[];
