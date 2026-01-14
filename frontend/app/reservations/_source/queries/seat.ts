import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BlockDataResponse,
  ReservationResponse,
  SeatDataResponse,
} from "../types/reservationType";

// 현재 id는 사용되지 않지만 추후 백엔드에서 구현 시 사용 예정
export const useSeatMetaQuery = (id: string = "") => {
  return useSuspenseQuery<SeatDataResponse>({
    queryKey: ["seat", id],
    queryFn: async () => {
      const response = await fetch(`/api/mock/seatMeta`);
      if (!response.ok) {
        throw new Error("좌석 불러오기 실패");
      }
      return response.json();
    },
  });
};

export const useBlockSeatQuery = (id: string = "") => {
  return useSuspenseQuery<BlockDataResponse>({
    queryKey: ["blockSeat", id],
    queryFn: async () => {
      const response = await fetch(`/api/mock/blockData`);
      if (!response.ok) {
        throw new Error("차단 좌석 불러오기 실패");
      }
      return response.json();
    },
  });
};

export const useReservedSeatQuery = (id: string = "") => {
  return useSuspenseQuery<ReservationResponse>({
    queryKey: ["reservedSeat", id],
    queryFn: async () => {
      const response = await fetch(`/api/mock/reservations`);
      if (!response.ok) {
        throw new Error("예약된 좌석 불러오기 실패");
      }
      return response.json();
    },
  });
};
