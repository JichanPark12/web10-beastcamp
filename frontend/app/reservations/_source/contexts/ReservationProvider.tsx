"use client";

import { createContext, useContext, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { Seat } from "../types/reservationType";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";

interface ReservationContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

interface ReservationProviderProps {
  children: ReactNode;
}

export function ReservationProvider({ children }: ReservationProviderProps) {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, Seat>(new Map(), { max: RESERVATION_LIMIT });

  const router = useRouter();

  const handleClickReserve = () => {
    try {
      // throw new Error("예매 실패");
      router.push("/result");
    } catch (e) {
      console.error(e);
      alert("예매에 실패했습니다. 다시 시도해주세요.");
    }
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
