"use client";

import { createContext, useContext, ReactNode } from "react";

interface ResultContextValue {
  rank?: string;
}

const ResultContext = createContext<ResultContextValue | null>(null);

interface ResultProviderProps {
  children: ReactNode;
  rank?: string;
}

export function ResultProvider({ children, rank }: ResultProviderProps) {
  return (
    <ResultContext.Provider value={{ rank }}>{children}</ResultContext.Provider>
  );
}

export function useResult() {
  const context = useContext(ResultContext);
  if (!context) {
    throw new Error("useResult must be used within a ResultProvider");
  }
  return context;
}
