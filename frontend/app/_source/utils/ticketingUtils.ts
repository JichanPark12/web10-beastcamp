import { Session } from "@/types/performance";

export const formatTicketingTime = (ticketingDate?: Date | string) => {
  if (!ticketingDate) return "";

  const date = new Date(ticketingDate);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

export const getTicketingStatusText = (
  status: "ticketing" | "waiting" | "ended",
) => {
  switch (status) {
    case "ticketing":
      return "티켓팅 진행중";
    case "waiting":
      return "티켓팅 오픈 대기중";
    case "ended":
      return "티켓팅 시간 계산중";
    default:
      return "";
  }
};

export const formatPerformanceDateRange = (sessions?: Session[]) => {
  if (!sessions || sessions.length === 0) return "";

  const dates = sessions.map((s) => new Date(s.sessionDate).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));

  const formatDateTime = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();

    return `${year}년 ${month}월 ${day}일 `;
  };

  if (minDate.getTime() === maxDate.getTime()) {
    return formatDateTime(minDate);
  } else {
    return `${formatDateTime(minDate)} ~ ${formatDateTime(maxDate)}`;
  }
};
