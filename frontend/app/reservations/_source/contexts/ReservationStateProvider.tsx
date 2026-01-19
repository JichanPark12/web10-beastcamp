"use client";

import { createContext, ReactNode, use, useState } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";
import { Seat } from "../types/reservationType";

interface ReservationStateContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  area: string | null;
  isShowArea: boolean;
}

interface ReservationDispatchContextValue {
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
  handleSelectArea: (areaId: string) => void;
  handleDeselectArea: () => void;
}

export const ReservationStateContext =
  createContext<ReservationStateContextValue | null>(null);
export const ReservationDispatchContext =
  createContext<ReservationDispatchContextValue | null>(null);

interface ReservationStateProviderProps {
  children: ReactNode;
}

export function ReservationStateProvider({
  children,
}: ReservationStateProviderProps) {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, Seat>(new Map(), { max: RESERVATION_LIMIT });

  const [area, setArea] = useState<string | null>(null);
  const isShowArea = !!area;

  const handleSelectArea = (areaId: string) => {
    setArea(areaId);
  };

  const handleDeselectArea = () => {
    setArea(null);
  };

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

  const stateValue: ReservationStateContextValue = {
    selectedSeats,
    area,
    isShowArea,
  };

  const dispatchValue: ReservationDispatchContextValue = {
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleClickReserve,
    handleSelectArea,
    handleDeselectArea,
  };

  return (
    <ReservationStateContext.Provider value={stateValue}>
      <ReservationDispatchContext.Provider value={dispatchValue}>
        {children}
      </ReservationDispatchContext.Provider>
    </ReservationStateContext.Provider>
  );
}

export function useReservationState() {
  const context = use(ReservationStateContext);
  if (!context) {
    throw new Error("ReservationStateProvider가 필요합니다.");
  }
  return context;
}

export function useReservationDispatch() {
  const context = use(ReservationDispatchContext);
  if (!context) {
    throw new Error("ReservationDispatchProvider가 필요합니다.");
  }
  return context;
}
