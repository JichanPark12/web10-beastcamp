const venueDetail = {
  id: 1,
  venueName: "올림픽공원 올림픽홀",
  blockMapUrl: "/incheon_namdong_gymnasium.svg",
  blocks: [
    { id: 1, blockDataName: "C2", rowSize: 10, colSize: 10 },
    { id: 2, blockDataName: "G2", rowSize: 10, colSize: 10 },
    { id: 3, blockDataName: "F2", rowSize: 10, colSize: 10 },
    { id: 4, blockDataName: "E2", rowSize: 10, colSize: 10 },
    { id: 5, blockDataName: "D2", rowSize: 10, colSize: 10 },
    { id: 6, blockDataName: "B2", rowSize: 10, colSize: 10 },
    { id: 7, blockDataName: "A2", rowSize: 10, colSize: 10 },
    { id: 8, blockDataName: "T2", rowSize: 10, colSize: 10 },
    { id: 9, blockDataName: "S2", rowSize: 10, colSize: 10 },
    { id: 10, blockDataName: "Q2", rowSize: 10, colSize: 10 },
    { id: 11, blockDataName: "R2", rowSize: 10, colSize: 10 },
    { id: 12, blockDataName: "G1", rowSize: 10, colSize: 10 },
    { id: 13, blockDataName: "H1", rowSize: 10, colSize: 10 },
    { id: 14, blockDataName: "F1", rowSize: 10, colSize: 10 },
    { id: 15, blockDataName: "E1", rowSize: 10, colSize: 10 },
    { id: 16, blockDataName: "D1", rowSize: 10, colSize: 10 },
    { id: 17, blockDataName: "S1", rowSize: 10, colSize: 10 },
    { id: 18, blockDataName: "R1", rowSize: 10, colSize: 10 },
    { id: 19, blockDataName: "T1", rowSize: 10, colSize: 10 },
    { id: 20, blockDataName: "U1", rowSize: 10, colSize: 10 },
    { id: 21, blockDataName: "V1", rowSize: 10, colSize: 10 },
    { id: 22, blockDataName: "A1", rowSize: 10, colSize: 10 },
    { id: 23, blockDataName: "B1", rowSize: 10, colSize: 10 },
    { id: 24, blockDataName: "X1", rowSize: 10, colSize: 10 },
    { id: 25, blockDataName: "C1", rowSize: 10, colSize: 10 },
    { id: 26, blockDataName: "W1", rowSize: 10, colSize: 10 },
    { id: 27, blockDataName: "1", rowSize: 10, colSize: 10 },
    { id: 28, blockDataName: "4", rowSize: 10, colSize: 10 },
    { id: 29, blockDataName: "2", rowSize: 10, colSize: 10 },
    { id: 30, blockDataName: "3", rowSize: 10, colSize: 10 },
    { id: 31, blockDataName: "5", rowSize: 10, colSize: 10 },
    { id: 32, blockDataName: "8", rowSize: 10, colSize: 10 },
    { id: 33, blockDataName: "6", rowSize: 10, colSize: 10 },
    { id: 34, blockDataName: "7", rowSize: 10, colSize: 10 },
  ],
};

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  const { id: idString } = await params;
  const id = parseInt(idString);
  if (id !== 1) {
    return Response.json({}, { status: 200 }); // Backend style empty object for not found/invalid
  }
  return Response.json(venueDetail, { status: 200 });
};
