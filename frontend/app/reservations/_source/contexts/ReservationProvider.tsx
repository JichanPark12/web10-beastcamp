"use client";

import { ReactNode } from "react";
import { BlockGrade, Grade } from "@/types/venue";
import { ReservationDataProvider } from "./ReservationDataProvider";
import { ReservationStateProvider } from "./ReservationStateProvider";

export { useReservationData } from "./ReservationDataProvider";
export {
  useReservationState,
  useReservationDispatch,
} from "./ReservationStateProvider";

interface ReservationProviderProps {
  children: ReactNode;
  blockGrades: BlockGrade[];
  grades: Grade[];
}

export function ReservationProvider({
  children,
  blockGrades,
  grades,
}: ReservationProviderProps) {
  return (
    <ReservationDataProvider blockGrades={blockGrades} grades={grades}>
      <ReservationStateProvider>{children}</ReservationStateProvider>
    </ReservationDataProvider>
  );
}
