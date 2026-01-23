"use client";

import { Clock } from "lucide-react";
import { useTimeLog } from "../../hooks/useTimeLog";

export default function TimeLog() {
  let { timeLog, totalTime } = useTimeLog();
  timeLog = {
    queue: 10.4,
    captcha: 4.3,
    seats: 2.3,
  };
  totalTime = 17;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h4 className="mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-400" />
        단계별 소요 시간
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">대기열 통과</span>
          <span>{timeLog.queue?.toFixed(1)}초</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">보안문자 입력</span>
          <span>{timeLog.captcha?.toFixed(1)}초</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">좌석 선택</span>
          <span>{timeLog.seats?.toFixed(1)}초</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
          <span>총 소요 시간</span>
          <span className="text-purple-600">{totalTime.toFixed(1)}초</span>
        </div>
      </div>
    </div>
  );
}
