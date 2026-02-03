"use client";

import { createContext, ReactNode, use, useState } from "react";
import useSelection from "@/hooks/useSelector";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";
import { Seat } from "../types/reservationType";
import { useExitPage } from "../hooks/useExitPage";

interface ReservationStateContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  area: string | null;
  isCaptchaVerified: boolean;
}

interface ReservationDispatchContextValue {
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleSelectArea: (areaId: string) => void;
  handleDeselectArea: () => void;
  completeCaptcha: () => void;
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
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);

  useExitPage();

  const completeCaptcha = () => {
    setIsCaptchaVerified(true);
  };

  const handleSelectArea = (areaId: string) => {
    setArea(areaId);
  };

  const handleDeselectArea = () => {
    setArea(null);
  };

  const stateValue: ReservationStateContextValue = {
    selectedSeats,
    area,
    isCaptchaVerified,
  };

  const dispatchValue: ReservationDispatchContextValue = {
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleSelectArea,
    handleDeselectArea,
    completeCaptcha,
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
  return {
    ...context,
    isShowArea: !!context.area,
  };
}

export function useReservationDispatch() {
  const context = use(ReservationDispatchContext);
  if (!context) {
    throw new Error("ReservationDispatchProvider가 필요합니다.");
  }
  return context;
}
