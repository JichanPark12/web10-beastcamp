"use client";

import { useScheduledTicketingQuery } from "../../queries/ticketingSchdule";
import { TicketingPreviewCard } from "./TicketingPreviewCard";

import { useTicketingRouting } from "../../hooks/useTicketingRouting";

export default function PreviewCards() {
  const { data: scheduledTicketings } = useScheduledTicketingQuery(null, 5);
  const { navigateToExternal } = useTicketingRouting();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {scheduledTicketings.map((ticketing) => (
        <div
          key={ticketing.performance_id}
          onClick={() => navigateToExternal(ticketing)}
          className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200 group cursor-pointer max-w-[230px] w-full mx-auto"
        >
          <TicketingPreviewCard
            platform={ticketing.platform}
            performanceName={ticketing.performance_name}
            ticketingDate={ticketing.ticketing_date}
            posterUrl={ticketing.poster_url}
          />
        </div>
      ))}
    </div>
  );
}
