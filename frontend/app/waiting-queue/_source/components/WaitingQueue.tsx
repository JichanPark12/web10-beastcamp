"use client";

import { usePreventRefresh } from "@/hooks/usePreventRefresh";
import { useWaitingQueue } from "../hooks/useWaitingQueue";
import ProgressBar from "./ProgressBar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WaitingQueue() {
  const router = useRouter();
  const { data, isError, isFinished } = useWaitingQueue();

  usePreventRefresh();

  useEffect(() => {
    if (isFinished) {
      router.push("/reservations");
    }
  }, [isFinished, router]);

  const statusText = isFinished ? "입장 중입니다" : `${data?.order ?? 0}번`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-xl">
        <div className="text-center py-8">
          {/* Header */}
          <h3 className="text-2xl mb-2">대기열 진행 중</h3>
          <p className="text-gray-500 mb-8 text-xl">{statusText}</p>

          <div className="max-w-md mx-auto">
            {/* Progress */}
            <div className="bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <ProgressBar value={data?.order ?? 0} />
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-8"></div>

            {/* Notice */}
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
              <p className="text-sm text-gray-600">
                ⚠️ 새로고침 하거나 재접속 하시면
                <br />
                대기순서가 초기화되어 대기시간이 더 길어집니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
