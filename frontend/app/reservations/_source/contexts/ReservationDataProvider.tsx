"use client";

import { createContext, ReactNode, use } from "react";
import { BlockGrade, VenueDetail, Grade } from "@/types/venue";
import { Performance, Session } from "@/types/performance";
import { useTicketContext } from "@/app/_source/contexts/TicketContext";
import useRefreshGuard from "@/hooks/useRefreshGuard";

interface ReservationDataContextValue {
  venue: VenueDetail | null;
  performance: Performance;
  session: Session;
  blockGrades: BlockGrade[];
  grades: Grade[];
}

export const ReservationDataContext =
  createContext<ReservationDataContextValue | null>(null);

interface ReservationDataProviderProps {
  children: ReactNode;
  blockGrades: BlockGrade[];
  grades: Grade[];
}

export function ReservationDataProvider({
  children,
  blockGrades,
  grades,
}: ReservationDataProviderProps) {
  const {
    performance: performanceData,
    venue,
    selectedSession,
  } = useTicketContext();

  useRefreshGuard(!!selectedSession);

  if (!performanceData || !selectedSession) {
    return null;
  }

  const dataValue: ReservationDataContextValue = {
    venue,
    performance: performanceData,
    session: selectedSession,
    blockGrades,
    grades,
  };

  return (
    <ReservationDataContext.Provider value={dataValue}>
      {children}
    </ReservationDataContext.Provider>
  );
}

export function useReservationData() {
  const context = use(ReservationDataContext);
  if (!context) {
    throw new Error("ReservationDataProvider가 필요합니다.");
  }
  return context;
}
