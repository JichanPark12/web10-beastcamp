
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


