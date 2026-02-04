import { ExternalLink } from "lucide-react";
import { Performance } from "@/types/performance";
import { useTicketingRouting } from "@/app/_source/hooks/useTicketingRouting";

interface ExternalBookingBannerProps {
  performance: Performance;
}

export default function ExternalBookingBanner({
  performance,
}: ExternalBookingBannerProps) {
  const { navigateToExternal } = useTicketingRouting();

  if (!performance.platform_ticketing_url) return null;

  return (
    <div className="py-10">
      <button
        onClick={() => navigateToExternal(performance)}
        className="group relative w-full overflow-hidden rounded-2xl bg-white border border-gray-100 p-8 text-left shadow-sm transition-all hover:shadow-xl hover:border-purple-100"
      >
        <div className="relative flex items-center justify-between z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                실제 예매 사이트 확인하기
              </h3>
            </div>
            <p className="text-gray-500 group-hover:text-gray-600 max-w-lg">
              이 공연의 실제 티켓팅 페이지로 이동합니다.
              <br />
              <span className="text-sm text-gray-400">
                {performance.platform_ticketing_url}
              </span>
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-inner transition-all group-hover:bg-purple-600 group-hover:text-white group-hover:shadow-lg group-hover:scale-110">
            <ExternalLink className="h-6 w-6" />
          </div>
        </div>
      </button>
    </div>
  );
}
