"use client";

import { createContext, ReactNode, use, useState } from "react";
import { useRouter } from "next/navigation";
import useSelection from "@/hooks/useSelector";
import { ApiError } from "@/lib/api/api";
import { useQueryClient } from "@tanstack/react-query";
import { useResult } from "@/contexts/ResultContext";
import { useReservationMutation } from "../queries/reservation";
import { useAuth } from "@/contexts/AuthContext";
import { RESERVATION_LIMIT } from "../constants/reservationConstants";
import { Seat } from "../types/reservationType";
import { useTimeLogStore } from "@/hooks/timeLogStore";
import { useReservationData } from "./ReservationDataProvider";
import { useExitPage } from "../hooks/useExitPage";

interface ReservationStateContextValue {
  selectedSeats: ReadonlyMap<string, Seat>;
  area: string | null;
  isReserving: boolean;
}

interface ReservationDispatchContextValue {
  handleToggleSeat: (seatId: string, seat: Seat) => void;
  handleRemoveSeat: (seatId: string) => void;
  handleResetSeats: () => void;
  handleClickReserve: (
    sessionId: number,
    selectedSeats: ReadonlyMap<string, Seat>,
  ) => void;
  handleSelectArea: (areaId: string) => void;
  handleDeselectArea: () => void;
  completeCaptcha: () => void;
}

export const ReservationStateContext =
  createContext<ReservationStateContextValue | null>(null);
export const ReservationDispatchContext =
  createContext<ReservationDispatchContextValue | null>(null);

interface ReservationStateProviderProps {
  children: ReactNode;
}

export function ReservationStateProvider({
  children,
}: ReservationStateProviderProps) {
  const {
    selected: selectedSeats,
    toggle: handleToggleSeat,
    remove: handleRemoveSeat,
    reset: handleResetSeats,
  } = useSelection<string, Seat>(new Map(), { max: RESERVATION_LIMIT });

  const queryClient = useQueryClient();
  const { token } = useAuth();
  const mutation = useReservationMutation(token || "");

  const endSeatSelection = useTimeLogStore((state) => state.endSeatSelection); // 체류 시간 측정

  const [area, setArea] = useState<string | null>(null);
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const { venue } = useReservationData();
  useExitPage();

  const completeCaptcha = () => {
    setIsCaptchaVerified(true);
  };

  const handleSelectArea = (areaId: string) => {
    setArea(areaId);
  };

  const handleDeselectArea = () => {
    setArea(null);
  };

  const router = useRouter();

  const { setResult } = useResult();

  const handleClickReserve = (
    sessionId: number,
    selectedSeats: ReadonlyMap<string, Seat>,
  ) => {
    if (!isCaptchaVerified) {
      alert("보안문자가 입력되지 않았습니다.");
      return;
    }

    const seats = [...selectedSeats.values()].map((seat) => ({
      block_id: +seat.blockNum,
      row: +seat.rowNum - 1,
      col: +seat.colNum - 1,
    }));

    mutation.mutate(
      { session_id: sessionId, seats },
      {
        onSuccess: (response) => {
          const result = {
            rank: response.rank,
            seats: response.seats.map((seat) => ({
              blockName:
                venue?.blocks.find((b) => b.id === seat.block_id)
                  ?.blockDataName || "구역 정보가 없습니다.",
              row: +seat.row + 1,
              col: +seat.col + 1,
            })),
          };
          endSeatSelection();
          setResult(result);
          router.replace("/result");
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.status === 403) {
              alert("마감된 티케팅 입니다.메인으로 이동합니다.");
              router.replace("/");
              return;
            }
            if (error.status === 400) {
              alert("이미 선점된 좌석입니다.");
              queryClient.invalidateQueries({
                queryKey: ["reservation-seats", sessionId, area],
              });
              return;
            }
          }
          console.error(error);
          alert("예매에 실패했습니다. 다시 시도해주세요.");
        },
      },
    );
  };

  const stateValue: ReservationStateContextValue = {
    selectedSeats,
    area,
    isReserving: mutation.isPending,
  };

  const dispatchValue: ReservationDispatchContextValue = {
    handleToggleSeat,
    handleRemoveSeat,
    handleResetSeats,
    handleClickReserve,
    handleSelectArea,
    handleDeselectArea,
    completeCaptcha,
  };

  return (
    <ReservationStateContext.Provider value={stateValue}>
      <ReservationDispatchContext.Provider value={dispatchValue}>
        {children}
      </ReservationDispatchContext.Provider>
    </ReservationStateContext.Provider>
  );
}

export function useReservationState() {
  const context = use(ReservationStateContext);
  if (!context) {
    throw new Error("ReservationStateProvider가 필요합니다.");
  }
  return {
    ...context,
    isShowArea: !!context.area,
  };
}

export function useReservationDispatch() {
  const context = use(ReservationDispatchContext);
  if (!context) {
    throw new Error("ReservationDispatchProvider가 필요합니다.");
  }
  return context;
}
