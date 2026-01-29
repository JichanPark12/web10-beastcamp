const grades: Record<number, { name: string; price: number }> = {
  1: { name: "VIP", price: 150000 },
  2: { name: "R", price: 120000 },
  3: { name: "S", price: 90000 },
  4: { name: "A", price: 60000 },
};

const blockGrades = [
  // Floor / Number Blocks -> VIP (Grade 1)
  { blockId: 27, gradeId: 1 },
  { blockId: 28, gradeId: 1 },
  { blockId: 29, gradeId: 1 },
  { blockId: 30, gradeId: 1 },
  { blockId: 31, gradeId: 1 },
  { blockId: 32, gradeId: 1 },
  { blockId: 33, gradeId: 1 },
  { blockId: 34, gradeId: 1 },

  // Major Side Zones -> R (Grade 2)
  { blockId: 7, gradeId: 2 },
  { blockId: 6, gradeId: 2 },
  { blockId: 1, gradeId: 2 },
  { blockId: 5, gradeId: 2 },
  { blockId: 22, gradeId: 2 },
  { blockId: 23, gradeId: 2 },
  { blockId: 25, gradeId: 2 },
  { blockId: 16, gradeId: 2 },

  // Outer / Rear Zones -> S (Grade 3)
  { blockId: 4, gradeId: 3 },
  { blockId: 3, gradeId: 3 },
  { blockId: 2, gradeId: 3 },
  { blockId: 15, gradeId: 3 },
  { blockId: 14, gradeId: 3 },
  { blockId: 12, gradeId: 3 },
  { blockId: 13, gradeId: 3 },

  // Peripherals -> A (Grade 4)
  { blockId: 8, gradeId: 4 },
  { blockId: 9, gradeId: 4 },
  { blockId: 10, gradeId: 4 },
  { blockId: 11, gradeId: 4 },
  { blockId: 17, gradeId: 4 },
  { blockId: 18, gradeId: 4 },
  { blockId: 19, gradeId: 4 },
  { blockId: 20, gradeId: 4 },
  { blockId: 21, gradeId: 4 },
  { blockId: 24, gradeId: 4 },
  { blockId: 26, gradeId: 4 },
];

const data = blockGrades.map((item) => ({
  blockId: item.blockId,
  grade: {
    id: item.gradeId,
    ...grades[item.gradeId],
  },
}));

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
