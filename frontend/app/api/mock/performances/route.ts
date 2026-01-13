const datas = [
  {
    performance_id: 1,
    performance_name: "임영웅 콘서트",
    ticketing_date: "2026-01-13T10:10:00Z",
    performance_date: "2026-02-15T19:00:00Z",
    venue_id: 1,
    venue_name: "잠실 주경기장",
  },
  {
    performance_id: 2,
    performance_name: "아이유 콘서트 <HEREH>",
    ticketing_date: "2026-01-20T20:00:00Z",
    performance_date: "2026-03-10T18:00:00Z",
    venue_id: 2,
    venue_name: "고척 스카이돔",
  },
  {
    performance_id: 3,
    performance_name: "BTS 월드 투어",
    ticketing_date: "2026-01-25T14:00:00Z",
    performance_date: "2026-04-05T19:30:00Z",
    venue_id: 1,
    venue_name: "잠실 주경기장",
  },
  {
    performance_id: 4,
    performance_name: "세븐틴 BE THE SUN",
    ticketing_date: "2026-02-01T20:00:00Z",
    performance_date: "2026-04-20T18:00:00Z",
    venue_id: 3,
    venue_name: "KSPO DOME",
  },
  {
    performance_id: 5,
    performance_name: "뉴진스 팬미팅",
    ticketing_date: "2026-02-10T19:00:00Z",
    performance_date: "2026-05-01T17:00:00Z",
    venue_id: 4,
    venue_name: "올림픽공원 체조경기장",
  },
  {
    performance_id: 6,
    performance_name: "블랙핑크 BORN PINK",
    ticketing_date: "2026-02-15T20:00:00Z",
    performance_date: "2026-05-15T19:00:00Z",
    venue_id: 2,
    venue_name: "고척 스카이돔",
  },
  {
    performance_id: 7,
    performance_name: "엔시티 드림 투어",
    ticketing_date: "2026-02-20T18:00:00Z",
    performance_date: "2026-06-01T18:30:00Z",
    venue_id: 3,
    venue_name: "KSPO DOME",
  },
];

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  const startAfter = searchParams.get("start_after");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 6;

  const result = [...datas]
    .sort(
      (a, b) =>
        new Date(b.ticketing_date).getTime() -
        new Date(a.ticketing_date).getTime()
    )
    .filter(
      (performance) =>
        !startAfter ||
        new Date(performance.ticketing_date) < new Date(startAfter)
    )
    .slice(0, limit);

  return Response.json({ performances: result });
};
