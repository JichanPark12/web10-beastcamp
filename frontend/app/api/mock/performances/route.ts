const datas = [
  {
    performance_id: 1,
    performance_name: "wave to earth - 사랑으로 0.3",
    ticketing_date: "2026-02-01T03:00:00Z",
    platform: "interpark",
  },
  {
    performance_id: 2,
    performance_name: "테스트공연2",
    ticketing_date: "2026-02-01T18:00:00Z",
    platform: "nol-ticket",
  },
  {
    performance_id: 3,
    performance_name: "테스트공연3",
    ticketing_date: "2026-03-01T19:00:00Z",
    platform: "yes24",
  },
  {
    performance_id: 4,
    performance_name: "테스트공연4",
    ticketing_date: "2026-04-01T20:00:00Z",
    platform: "melon-ticket",
  },
  {
    performance_id: 5,
    performance_name: "테스트공연5",
    ticketing_date: "2026-05-01T21:00:00Z",
    platform: "nol-ticket",
  },
  {
    performance_id: 6,
    performance_name: "테스트공연6",
    ticketing_date: "2026-06-01T22:00:00Z",
    platform: "yes24",
  },
  {
    performance_id: 7,
    performance_name: "테스트공연7",
    ticketing_date: "2026-07-01T23:00:00Z",
    platform: "melon-ticket",
  },
];

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);

  // const ticketingAfter = searchParams.get("ticketing_after");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 6;

  const result = [...datas]
    .sort(
      (a, b) =>
        new Date(a.ticketing_date).getTime() -
        new Date(b.ticketing_date).getTime(),
    )
    // .filter(
    //   (performance) =>
    //     !ticketingAfter ||
    //     new Date(performance.ticketing_date) > new Date(ticketingAfter),
    // )
    .slice(0, limit);

  return Response.json({ performances: result });
};
