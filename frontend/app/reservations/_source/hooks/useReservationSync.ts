import { useEffect, useEffectEvent } from "react";
import { useReservationSeatsQuery } from "../queries/seat";
import {
  useReservationState,
  useReservationDispatch,
} from "../contexts/ReservationProvider";
import { API_INDEX_ADJUSTMENT } from "../constants/reservationConstants";

export function useReservationSync(sessionId: number, area: string | null) {
  const { selectedSeats } = useReservationState();
  const { handleRemoveSeat } = useReservationDispatch();
  const { data: reservationData, refetch } = useReservationSeatsQuery(
    sessionId,
    area,
  );

  const checkReservedSeats = useEffectEvent(() => {
    if (!reservationData?.seats) return;

    selectedSeats.forEach((seat, seatId) => {
      const isReserved =
        reservationData.seats[seat.rowNum + API_INDEX_ADJUSTMENT]?.[
          seat.colNum + API_INDEX_ADJUSTMENT
        ];
      if (isReserved) {
        handleRemoveSeat(seatId);
      }
    });
  });

  useEffect(() => {
    checkReservedSeats();
  }, [reservationData]);

  return { reservationData, refetch };
}
