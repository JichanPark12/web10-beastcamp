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
  const {
    initialOrder,
    currentOrder,
    isFinished,
    isLoading,
    isError,
    token,
    status,
  } = useWaitingQueue();
  const { setToken } = useAuth();

  const startWaitingQueue = useTimeLogStore((state) => state.startWaitingQueue);
  const endWaitingQueue = useTimeLogStore((state) => state.endWaitingQueue);
  const resetAllTimers = useTimeLogStore((state) => state.resetAllTimers);

  usePreventRefresh();

  useEffect(() => {
    resetAllTimers();
    startWaitingQueue();
  }, [resetAllTimers, startWaitingQueue]);
  // isFinished 상태에 따른 대기열 타이머 종료 후 다음 페이지로 이동

  useEffect(() => {
    if (isFinished && token) {
      endWaitingQueue();
      setToken(token);
      const searchParams = new URLSearchParams(window.location.search);
      router.replace(`/reservations?${searchParams.toString()}`);
    }
  }, [isFinished, router, token, setToken, endWaitingQueue]);

  useEffect(() => {
    if (isLoading) return;

    if (isError || initialOrder === undefined || status === "closed") {
      alert("마감된 티케팅 입니다. 메인으로 이동합니다.");
      router.replace("/");
    }
  }, [isLoading, isError, initialOrder, status, router]);

  if (isLoading) {
    return <div>대기열 진입 중...</div>;
  }

  // 에러/마감 시 렌더링 차단 (alert 후 이동 대기)
  if (isError || initialOrder === undefined || status === "closed") {
    return null;
  }
  const statusText = isFinished ? "입장 중입니다" : `${currentOrder ?? 0}번`;

  return (
    <div className="flex flex-col gap-y-8 my-8">
      <p className="text-gray-500  text-xl text-center">{statusText}</p>

      <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
        <ProgressBar value={currentOrder ?? 0} maxValue={initialOrder ?? 0} />
      </div>
    </div>
  );
}
