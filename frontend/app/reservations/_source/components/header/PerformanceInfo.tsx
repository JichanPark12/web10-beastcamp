"use client";

import { useReservationData } from "../../contexts/ReservationDataProvider";

export default function PerformanceInfo() {
  const { performance, session, venue } = useReservationData();

  const date = new Date(session.sessionDate);

  const formattedDate = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedTime = date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <h2 className="text-xl">{performance.performance_name}</h2>
      <p className="text-sm text-gray-500">
        {formattedDate} {formattedTime} · {venue?.venueName}
      </p>
    </div>
  );
}
