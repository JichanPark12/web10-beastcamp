import { PLATFORM_DISPLAY_NAME } from "@/constants/performance";
import { Performance, Session } from "@/types/performance";
import { Calendar, MapPin, TrendingUp } from "lucide-react";
import { formatPerformanceDateRange } from "../../utils/ticketingUtils";

interface PerformanceInfoProps {
  performance: Performance;
  sessions?: Session[];
  venueName?: string;
}

export default function PerformanceInfo({
  performance,
  sessions,
  venueName,
}: PerformanceInfoProps) {
  const dateDisplay = formatPerformanceDateRange(sessions);

  const platformDisplayName = performance.platform
    ? PLATFORM_DISPLAY_NAME[performance.platform]
    : PLATFORM_DISPLAY_NAME["nol-ticket"];

  return (
    <div className="gap-8 items-center w-full">
      <div>
        <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
          <span className="text-sm">다음 티켓팅</span>
        </div>

        <h2 className="text-3xl md:text-4xl mb-4">
          {performance.performance_name}
        </h2>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white/80" />
            <span className="text-nowrap">
              {dateDisplay || (
                <span className="animate-pulse bg-white/20 rounded h-5 w-48 inline-block" />
              )}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-white/80" />
            <span>
              {venueName || (
                <span className="animate-pulse bg-white/20 rounded h-5 w-32 inline-block" />
              )}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
            콘서트
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg text-sm">
            {platformDisplayName}
          </span>
          <span
            className={`bg-white/20 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1`}
          >
            <TrendingUp className="w-4 h-4" />
            난이도: 상
          </span>
        </div>
      </div>
    </div>
  );
}
