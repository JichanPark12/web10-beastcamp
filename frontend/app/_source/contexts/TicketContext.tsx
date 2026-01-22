"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Performance, Session } from "@/types/performance";
import { VenueDetail } from "@/types/venue";

interface TicketContextType {
  // 공연 정보 (ex 공연 이름)
  performance: Performance | null;
  setPerformance: (p: Performance) => void;
  // 공연장 정보 (ex 공연장 이름,좌석 배치도정보)
  venue: VenueDetail | null;
  setVenue: (v: VenueDetail) => void;
  // 선택된 세션 정보 (ex 공연 시간, 공연장 ID 사실상 하나의 회차에 해당합니다.)
  selectedSession: Session | null;
  selectSession: (s: Session | null) => void;
}

const TicketContext = createContext<TicketContextType | null>(null);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [venue, setVenue] = useState<VenueDetail | null>(null);
  const [selectedSession, selectSession] = useState<Session | null>(null);

  return (
    <TicketContext.Provider
      value={{
        performance,
        setPerformance,
        venue,
        setVenue,
        selectedSession,
        selectSession,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTicketContext() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error("useTicketContext must be used within a TicketProvider");
  }
  return context;
}
