const data = [
  {
    id: 1,
    name: "VIP",
    price: 150000,
  },
  {
    id: 2,
    name: "R",
    price: 100000,
  },
  {
    id: 3,
    name: "S",
    price: 50000,
  },
  {
    id: 4,
    name: "A",
    price: 20000,
  },
];

export const GET = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const id = parseInt((await params).id);

  if (id !== 1) {
    return Response.json({}, { status: 404 });
  }

  return Response.json(data, { status: 200 });
};
