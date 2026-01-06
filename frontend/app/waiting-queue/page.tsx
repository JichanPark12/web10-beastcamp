"use client";

import { usePreventRefresh } from "@/hooks/usePreventRefresh";

const WAINTING_ORDER = 5;

export default function WaitingQueuePage() {
  usePreventRefresh();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-center">
      <span>나의 대기 순서</span>
      <span>{WAINTING_ORDER}</span>

      <div className="w-50 bg-gray-400 my-4">progress bar</div>

      <span>
        ⚠️ 새로고침 하거나 재접속 하시면
        <br />
        대기순서가 초기화되어 대기시간이 더 길어집니다.
      </span>
    </div>
  );
}
