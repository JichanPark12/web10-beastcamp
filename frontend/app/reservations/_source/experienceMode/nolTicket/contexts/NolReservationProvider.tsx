"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { NolSeat } from "@/app/reservations/_source/types/reservationType";
import { RESERVATION_LIMIT } from "@/app/reservations/_source/constants/reservationConstants";
import { useTimeLogStore } from "@/hooks/timeLogStore";

interface ReservationContextValue {
  selectedSeats: ReadonlyMap<string, NolSeat>;
  handleToggleSeat: (seatId: string, seat: NolSeat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

interface ReservationProviderProps {
  children: ReactNode;
}

export function NolReservationProvider({ children }: ReservationProviderProps) {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, NolSeat>(new Map(), { max: RESERVATION_LIMIT });
  const endSeatSelection = useTimeLogStore((state) => state.endSeatSelection);

  const router = useRouter();

  const handleClickReserve = () => {
    endSeatSelection();
    router.push("/result");
  };

  const value: ReservationContextValue = {
    selectedSeats,
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleClickReserve,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error("useReservation must be used within ReservationProvider");
  }
  return context;
}
