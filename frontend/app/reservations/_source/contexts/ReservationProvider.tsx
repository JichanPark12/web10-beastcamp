"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { Seat } from "../types/reservationType";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";
import { CaptchaModal } from "@/components/captcha-modal";

interface ReservationContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

interface ReservationProviderProps {
  children: ReactNode;
}

export function ReservationProvider({ children }: ReservationProviderProps) {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, Seat>(new Map(), { max: RESERVATION_LIMIT });

  const router = useRouter();
  const [isCaptchaModalOpen, setIsCaptchaModalOpen] = useState(true); // 페이지 진입 시 즉시 모달 표시
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false); // 보안 문자 검증 완료 여부

  const handleClickReserve = () => {
    // 좌석 선택 확인
    if (selectedSeats.size === 0) {
      alert("좌석을 선택해주세요.");
      return;
    }

    // 예매 진행
    try {
      router.push("/result");
    } catch (e) {
      console.error(e);
      alert("예매에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleCaptchaVerified = () => {
    // 보안 문자 인증 성공 시 모달만 닫기
    setIsCaptchaModalOpen(false);
    setIsCaptchaVerified(true);
  };

  const handleCloseCaptchaModal = () => {
    setIsCaptchaModalOpen(false);
  };

  const value: ReservationContextValue = {
    selectedSeats,
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleClickReserve,
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
      <CaptchaModal
        isOpen={isCaptchaModalOpen}
        onVerified={handleCaptchaVerified}
        onClose={handleCloseCaptchaModal}
      />
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
