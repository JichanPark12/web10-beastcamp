const datas = [
  {
    performance_id: 1,
    performance_name: "임영웅 콘서트",
    ticketing_date: "2026-01-30T10:00:00Z",
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
