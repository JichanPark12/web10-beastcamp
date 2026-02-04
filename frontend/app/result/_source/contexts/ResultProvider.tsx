"use client";

import { createContext, useContext, ReactNode } from "react";

interface ResultContextValue {
  rank?: string;
  virtualUserSize?: number;
}

const ResultContext = createContext<ResultContextValue | null>(null);

interface ResultProviderProps {
  children: ReactNode;
  rank?: string;
  virtualUserSize?: number;
}

export function ResultProvider({
  children,
  rank,
  virtualUserSize,
}: ResultProviderProps) {
  return (
    <ResultContext.Provider value={{ rank, virtualUserSize }}>
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
