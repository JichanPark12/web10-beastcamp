"use client";

import { createContext, ReactNode, use } from "react";
import { BlockGrade, VenueDetail, Grade } from "@/types/venue";
import { Performance, Session } from "@/types/performance";

interface ReservationDataContextValue {
  venue: VenueDetail | null;
  performance: Performance;
  sessions: Session[];
  blockGrades: BlockGrade[];
  grades: Grade[];
}

export const ReservationDataContext =
  createContext<ReservationDataContextValue | null>(null);

interface ReservationDataProviderProps {
  children: ReactNode;
  venue: VenueDetail | null;
  performance: Performance;
  sessions: Session[];
  blockGrades: BlockGrade[];
  grades: Grade[];
}

export function ReservationDataProvider({
  children,
  venue,
  performance,
  sessions,
  blockGrades,
  grades,
}: ReservationDataProviderProps) {
  const dataValue: ReservationDataContextValue = {
    venue,
    performance,
    sessions,
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
