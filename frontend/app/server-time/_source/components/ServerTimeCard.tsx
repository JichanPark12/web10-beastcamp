"use client";

import { useServerTime } from "../hooks/useServerTime";
import { TicketingSite } from "@/constants/ticketingSites";
import { RotateCcw } from "lucide-react";
import { formatServerTime } from "../utils/time";

export function ServerTimeCard({ site }: { site: TicketingSite }) {
  const { time, isLoading, isError, refresh } = useServerTime(site.url);
  const { hours, minutes, seconds } = formatServerTime(time);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-12 flex flex-col items-center justify-center gap-8 max-w-2xl w-full mx-auto transition-all duration-300">
      <div className="flex flex-col items-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-400 flex items-center gap-2">
          {site.name} 서버 시간
        </h2>

        <div className="flex items-center gap-4">
          <div className="h-32 flex items-center justify-center min-w-[300px]">
            {isLoading ? (
              <div className="animate-pulse bg-gray-100 h-24 w-80 rounded-2xl" />
            ) : isError ? (
              <div className="text-red-500 font-medium text-xl bg-red-50 px-6 py-3 rounded-full">
                연결 실패
              </div>
            ) : (
              <div className="font-mono text-7xl sm:text-8xl font-black tracking-tight tabular-nums flex items-baseline">
                <span className="text-gray-900">
                  {hours}:{minutes}:{seconds}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            className="p-3 rounded-full hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition-colors"
            title="시간 수동 동기화"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
