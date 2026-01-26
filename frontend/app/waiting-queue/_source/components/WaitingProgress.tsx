"use client";

import { usePreventRefresh } from "@/hooks/usePreventRefresh";
import ProgressBar from "./ProgressBar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useWaitingQueue } from "../hooks/useWaitingQueue";
import { useAuth } from "@/contexts/AuthContext";
import { useTimeLogStore } from "@/hooks/timeLogStore";

export default function WaitingProgress() {
  const router = useRouter();
  const { initialOrder, currentOrder, isFinished, isLoading, isError, token } =
    useWaitingQueue();
  const { setToken } = useAuth();

  const startWaitingQueue = useTimeLogStore((state) => state.startWaitingQueue);
  const endWaitingQueue = useTimeLogStore((state) => state.endWaitingQueue);
  const resetAllTimers = useTimeLogStore((state) => state.resetAllTimers);

  usePreventRefresh();

  // 컴포넌트 초기화 담당: 모든 타이머를 초기화하고 대기열 타이머 시작 설정
  useEffect(() => {
    resetAllTimers();
    startWaitingQueue();
  }, [resetAllTimers, startWaitingQueue]);

  // isFinished 상태에 따른 대기열 타이머 종료 후 다음 페이지로 이동
  useEffect(() => {
    if (isFinished && token) {
      endWaitingQueue();
      setToken(token);
      // sessionId 전달을 위해 URL 파라미터를 유지했습니다. (메인 페이지에서 sessionId 넘기는 중)
      const searchParams = new URLSearchParams(window.location.search);
      router.replace(`/reservations?${searchParams.toString()}`);
    }
  }, [isFinished, router, token, setToken, endWaitingQueue]);

  if (isLoading) {
    return <div>대기열 진입 중...</div>;
  }
  if (isError || initialOrder === undefined) {
    return <div>오류가 발생했습니다. 다시 시도해주세요.</div>;
  }
  const statusText = isFinished ? "입장 중입니다" : `${currentOrder ?? 0}번`;

  return (
    <div className="flex flex-col gap-y-8 my-8">
      <p className="text-gray-500  text-xl text-center">{statusText}</p>

      <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <ProgressBar value={currentOrder ?? 0} maxValue={initialOrder} />
      </div>
    </div>
  );
}
