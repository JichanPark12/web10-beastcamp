"use client";

import { createContext, ReactNode, useContext, useState } from "react";
interface ReservedSeat {
  blockName: string;
  row: number;
  col: number;
}

interface ReservationResult {
  rank: number;
  seats: ReservedSeat[];
  virtualUserSize: number;
  reservedAt: string;
}

interface ResultContextValue {
  result: ReservationResult | null;
  setResult: (result: ReservationResult | null) => void;
}

const ResultContext = createContext<ResultContextValue | null>(null);

export function ResultProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<ReservationResult | null>(null);

  return (
    <ResultContext.Provider value={{ result, setResult }}>
      {children}
    </ResultContext.Provider>
  );
}

export function useResult() {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResult must be used within a ResultProvider");
  }
  return context;
}
