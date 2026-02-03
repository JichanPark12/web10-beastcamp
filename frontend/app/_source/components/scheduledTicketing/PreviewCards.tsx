"use client";

import { useScheduledTicketingQuery } from "../../queries/ticketingSchdule";
import { TicketingPreviewCard } from "./TicketingPreviewCard";

export default function PreviewCards() {
  const { data: scheduledTicketings } = useScheduledTicketingQuery(null, 5);

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {scheduledTicketings.map((ticketing) => (
        <div
          key={ticketing.performance_id}
          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-purple-200 group cursor-pointer"
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
