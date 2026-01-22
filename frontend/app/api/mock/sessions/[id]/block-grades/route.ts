const data = [
  // Floor / Number Blocks -> VIP (Grade 1)
  { blockId: 27, gradeId: 1 }, // 1
  { blockId: 28, gradeId: 1 }, // 4
  { blockId: 29, gradeId: 1 }, // 2
  { blockId: 30, gradeId: 1 }, // 3
  { blockId: 31, gradeId: 1 }, // 5
  { blockId: 32, gradeId: 1 }, // 8
  { blockId: 33, gradeId: 1 }, // 6
  { blockId: 34, gradeId: 1 }, // 7

  // Major Side Zones -> R (Grade 2)
  { blockId: 7, gradeId: 2 }, // A2
  { blockId: 6, gradeId: 2 }, // B2
  { blockId: 1, gradeId: 2 }, // C2
  { blockId: 5, gradeId: 2 }, // D2
  { blockId: 22, gradeId: 2 }, // A1
  { blockId: 23, gradeId: 2 }, // B1
  { blockId: 25, gradeId: 2 }, // C1
  { blockId: 16, gradeId: 2 }, // D1

  // Outer / Rear Zones -> S (Grade 3)
  { blockId: 4, gradeId: 3 }, // E2
  { blockId: 3, gradeId: 3 }, // F2
  { blockId: 2, gradeId: 3 }, // G2
  { blockId: 15, gradeId: 3 }, // E1
  { blockId: 14, gradeId: 3 }, // F1
  { blockId: 12, gradeId: 3 }, // G1
  { blockId: 13, gradeId: 3 }, // H1

  // Peripherals -> A (Grade 4)
  { blockId: 8, gradeId: 4 }, // T2
  { blockId: 9, gradeId: 4 }, // S2
  { blockId: 10, gradeId: 4 }, // Q2
  { blockId: 11, gradeId: 4 }, // R2
  { blockId: 17, gradeId: 4 }, // S1
  { blockId: 18, gradeId: 4 }, // R1
  { blockId: 19, gradeId: 4 }, // T1
  { blockId: 20, gradeId: 4 }, // U1
  { blockId: 21, gradeId: 4 }, // V1
  { blockId: 24, gradeId: 4 }, // X1
  { blockId: 26, gradeId: 4 }, // W1
];

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);

  if (id < 1 || id > 6) {
    return Response.json({}, { status: 404 });
  }

  return Response.json(data, { status: 200 });
};
