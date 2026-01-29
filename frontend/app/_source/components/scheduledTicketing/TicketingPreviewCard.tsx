import { Calendar, Clock, MapPin } from "lucide-react";
import { TicketPlatform } from "@/types/performance";
import { formatDateTime } from "@/lib/utils";
import { PLATFORM_DISPLAY_NAME } from "@/constants/performance";

interface TicketingPreviewCardProps {
  platform: TicketPlatform;
  performanceName: string;
  ticketingDate: string;
  simulationDate?: string;
  posterUrl: string | null;
}

export function TicketingPreviewCard(props: TicketingPreviewCardProps) {
  return (
    <div className="group">
      {/* 포스터 */}
      <div>
        <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200 relative overflow-hidden">
          {props.posterUrl ? (
            <img
              src={props.posterUrl}
              alt={props.performanceName}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <Calendar className="w-12 h-12" />
            </div>
          )}
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs">
              {PLATFORM_DISPLAY_NAME[props.platform]}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h4 className="mb-2 line-clamp-2 min-h-[3rem] group-hover:text-purple-600 transition-colors">
          {props.performanceName}
        </h4>

        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 text-gray-600">
            <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <div>{formatDateTime(props.ticketingDate)}</div>
            </div>
          </div>

          {/* 공연장 이름 출력 X */}
          {/* <div className="flex items-start gap-2 text-gray-600">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>{props.venueName}</div>
          </div> */}

          {/* 현재 지원하지 않는 값이므로 조건문 처리 */}
          {props.simulationDate && (
            <div className="pt-2 mt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-purple-600">
                <Clock className="w-4 h-4 flex-shrink-0" />
                <div className="text-xs">
                  모의 티켓팅: {formatDateTime(props.simulationDate)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
