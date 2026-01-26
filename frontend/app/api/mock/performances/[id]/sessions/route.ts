const data = [
  // Day 1: 2026-02-28
  {
    id: 1,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-02-28T18:00:00Z", // 1회 18:00
  },

  // Day 2: 2026-03-01
  {
    id: 2,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-03-01T14:00:00Z", // 1회 14:00
  },
  {
    id: 3,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-03-01T19:00:00Z", // 2회 19:00
  },
];

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (id !== 1) {
    return Response.json({}, { status: 404 });
  }

  return Response.json(data, { status: 200 });
};
