import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useResult } from "@/contexts/ResultContext";
import { useReservationMutation } from "../queries/reservation";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeLogStore } from "@/hooks/timeLogStore";
import { useReservationData } from "../contexts/ReservationDataProvider";
import { useReservationState } from "../contexts/ReservationStateProvider";
import { ApiError } from "@/lib/api/api";
import { Seat } from "../types/reservationType";
import {
  API_INDEX_ADJUSTMENT,
  DISPLAY_INDEX_ADJUSTMENT,
} from "../constants/reservationConstants";
import { VenueBlock } from "@/types/venue";

export function useReservationTicket() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { setResult } = useResult();

  const { venue } = useReservationData();
  const { isCaptchaVerified, area } = useReservationState();
  const endSeatSelection = useTimeLogStore((state) => state.endSeatSelection);

  const mutation = useReservationMutation(token || "");

  const handleReservationSuccess = (response: {
    rank: number;
    seats: { block_id: number; row: number; col: number }[];
  }) => {
    const blockMap = createBlockMap(venue?.blocks || []);
    const result = {
      rank: response.rank,
      seats: transformSeatsForResult(response.seats, blockMap),
    };
    endSeatSelection();
    setResult(result);
    router.replace("/result");
  };

  const handleReservationError = (
    error: Error | ApiError,
    sessionId: number,
  ) => {
    if (error instanceof ApiError) {
      if (error.status === 403 || error.status === 401) {
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
  };

  const reserve = (
    sessionId: number,
    selectedSeats: ReadonlyMap<string, Seat>,
  ) => {
    if (!isCaptchaVerified) {
      alert("보안문자가 입력되지 않았습니다.");
      return;
    }

    const seats = transformSeatsForApi(selectedSeats);

    mutation.mutate(
      { session_id: sessionId, seats },
      {
        onSuccess: (response) => handleReservationSuccess(response),
        onError: (error) => handleReservationError(error, sessionId),
      },
    );
  };

  return {
    reserve,
    isReserving: mutation.isPending,
  };
}

const transformSeatsForApi = (selectedSeats: ReadonlyMap<string, Seat>) => {
  return [...selectedSeats.values()].map((seat) => ({
    block_id: +seat.blockNum,
    row: +seat.rowNum + API_INDEX_ADJUSTMENT,
    col: +seat.colNum + API_INDEX_ADJUSTMENT,
  }));
};

const createBlockMap = (blocks: VenueBlock[]) => {
  return new Map(blocks.map((b) => [b.id, b.blockDataName]));
};

const transformSeatsForResult = (
  apiSeats: { block_id: number; row: number; col: number }[],
  blockMap: Map<number, string>,
) => {
  return apiSeats.map((seat) => ({
    blockName: blockMap.get(seat.block_id) || "구역 정보가 없습니다.",
    row: +seat.row + DISPLAY_INDEX_ADJUSTMENT,
    col: +seat.col + DISPLAY_INDEX_ADJUSTMENT,
  }));
};
