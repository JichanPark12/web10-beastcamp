const data = [
  // Day 1: 2026-01-14
  {
    id: 1,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-01-14T14:00:00Z", // Round 1
  },
  {
    id: 2,
    performanceId: 1,
    venueId: 1, // Same venue
    sessionDate: "2026-01-14T19:00:00Z", // Round 2
  },

  // Day 2: 2026-01-15
  {
    id: 3,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-01-15T14:00:00Z", // Round 3
  },
  {
    id: 4,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-01-15T19:00:00Z", // Round 4
  },

  // Day 3: 2026-01-16
  {
    id: 5,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-01-16T14:00:00Z", // Round 5
  },
  {
    id: 6,
    performanceId: 1,
    venueId: 1,
    sessionDate: "2026-01-16T19:00:00Z", // Round 6
  },
];

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);
  console.log(id);

  if (id !== 1) {
    return Response.json({}, { status: 404 });
  }

  return Response.json(data, { status: 200 });
};
