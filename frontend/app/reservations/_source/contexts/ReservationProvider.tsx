"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";
import { BlockGrade, VenueDetail, Grade } from "@/types/venue";
import { Performance, Session } from "@/types/performance";
import { Seat } from "../types/reservationType";

interface ReservationContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
  venue: VenueDetail | null;
  performance: Performance;
  sessions: Session[];
  area: string | null;
  isShowArea: boolean;
  handleSelectArea: (areaId: string) => void;
  handleDeselectArea: () => void;
  blockGrades: BlockGrade[];
  grades: Grade[]; 
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

interface ReservationProviderProps {
  children: ReactNode;
  venue: VenueDetail | null;
  performance: Performance;
  sessions: Session[];
  blockGrades: BlockGrade[];
  grades: Grade[]; 
}

export function ReservationProvider({
  children,
  venue,
  performance,
  sessions,
  blockGrades,
  grades,
}: ReservationProviderProps) {
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

  const value: ReservationContextValue = {
    selectedSeats,
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleClickReserve,
    venue,
    performance,
    sessions,
    area,
    isShowArea,
    handleSelectArea,
    handleDeselectArea,
    blockGrades,
    grades,
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
