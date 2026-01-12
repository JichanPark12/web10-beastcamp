import { useSuspenseQuery } from "@tanstack/react-query";
import {
  BlockDataResponse,
  ReservationResponse,
  SeatDataResponse,
} from "../types/reservationType";
import { api } from "@/lib/api";

// 현재 id는 사용되지 않지만 추후 백엔드에서 구현 시 사용 예정
export const useSeatMetaQuery = (id: string = "") => {
  return useSuspenseQuery({
    queryKey: ["seat", id],
    queryFn: async () => {
      const response = await api.get<SeatDataResponse>(`/api/mock/seatMeta`);
      return response;
    },
  });
};

export const useBlockSeatQuery = (id: string = "") => {
  return useSuspenseQuery({
    queryKey: ["blockSeat", id],
    queryFn: async () => {
      const response = await api.get<BlockDataResponse>(`/api/mock/blockData`);

      return response;
    },
  });
};

export const useReservedSeatQuery = (id: string = "") => {
  return useSuspenseQuery({
    queryKey: ["reservedSeat", id],
    queryFn: async () => {
      const response = await api.get<ReservationResponse>(
        `/api/mock/reservations`
      );

      return response;
    },
  });
};
