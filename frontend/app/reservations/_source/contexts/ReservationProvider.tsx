"use client";

import { ReactNode } from "react";
import { BlockGrade, VenueDetail, Grade } from "@/types/venue";
import { Performance, Session } from "@/types/performance";
import {
  ReservationDataProvider,
  useReservationData,
} from "./ReservationDataProvider";
import {
  ReservationStateProvider,
  useReservationState,
  useReservationDispatch,
} from "./ReservationStateProvider";

export { useReservationData, useReservationState, useReservationDispatch };

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
  return (
    <ReservationDataProvider
      venue={venue}
      performance={performance}
      sessions={sessions}
      blockGrades={blockGrades}
      grades={grades}
    >
      <ReservationStateProvider>{children}</ReservationStateProvider>
    </ReservationDataProvider>
  );
}
