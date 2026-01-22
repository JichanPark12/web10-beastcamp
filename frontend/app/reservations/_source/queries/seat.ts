import { api } from "@/lib/api";
import { useSuspenseQuery } from "@tanstack/react-query";

interface ReservationResponse {
  seats: boolean[][];
}

export const useReservationSeatsQuery = (
  sessionId: number,
  blockId: string | null,
) => {
  return useSuspenseQuery<ReservationResponse>({
    queryKey: ["reservation-seats", sessionId, blockId],
    queryFn: async () => {
      const res = await api.get<ReservationResponse>(
        `/reservations?session_id=${sessionId}&block_id=${blockId}`,
      );
      return res;
    },
    staleTime: 0,
    gcTime: 0,
  });
};

// 구버전...

// export const useSeatMetaQuery = (id: string = "") => {
//   return useSuspenseQuery({
//     queryKey: ["seat", id],
//     queryFn: async () => {
//       const response = await api.get<SeatDataResponse>(`/seatMeta`);
//       return response;
//     },
//   });
// };

// export const useBlockSeatQuery = (id: string = "") => {
//   return useSuspenseQuery({
//     queryKey: ["blockSeat", id],
//     queryFn: async () => {
//       const response = await api.get<BlockDataResponse>(`/blockData`);

//       return response;
//     },
//   });
// };

// export const useReservedSeatQuery = (id: string = "") => {
//   return useSuspenseQuery({
//     queryKey: ["reservedSeat", id],
//     queryFn: async () => {
//       const response = await api.get<ReservationResponse>(`/reservations`);

//       return response;
//     },
//   });
// };
