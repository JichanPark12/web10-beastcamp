"use client";

import { Clock } from "lucide-react";
import { useTimeLogStore } from "@/hooks/timeLogStore";
import { formatTime } from "@/lib/utils";
import { useResult } from "@/contexts/ResultContext";
import { useExperienceMode } from "@/hooks/useExperienceMode";

export default function TimeLog() {
  const { result } = useResult();
  const { waitingQueue, captcha, seatSelection, getTotalDuration } =
    useTimeLogStore();
  const isExperience = useExperienceMode();

  const totalDuration = getTotalDuration();

  // 1. 대기열 진입 시간 (예매하기 버튼 클릭 시간)
  const entryTime = result?.reservedAt
    ? new Date(new Date(result.reservedAt).getTime() - totalDuration * 1000)
    : null;

  const openDelay = entryTime
    ? (entryTime.getTime() -
        (function () {
          const t = new Date(entryTime);
          t.setMinutes(Math.floor(t.getMinutes() / 5) * 5);
          t.setSeconds(0);
          t.setMilliseconds(0);
          return t.getTime();
        })()) /
      1000
    : 0;

  const totalTime = totalDuration + (isExperience ? 0 : openDelay);

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-500" />
        단계별 소요 시간
      </h4>
      <div className="space-y-3">
        {!isExperience && entryTime && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500"> 오픈 후 진입까지 경과 시간</span>
            <span>{formatTime(openDelay)}</span>
          </div>
        )}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500">대기열 통과</span>
          <span>{formatTime(waitingQueue.duration)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">보안문자 입력</span>
          <span>{formatTime(captcha.duration)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">좌석 선택</span>
          <span>{formatTime(seatSelection.duration)}</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span>총 소요 시간</span>
          <span className="text-purple-600">{formatTime(totalTime)}</span>
        </div>
      </div>
    </div>
  );
}
