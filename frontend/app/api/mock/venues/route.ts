const venues = [
  {
    id: 1,
    venue_name: "인천 남동 체육관",
    block_map_url: "/incheon_namdong_gymnasium.svg",
  },
];

export const GET = async () => {
  const res = {
    venues,
  };
  return Response.json(res, { status: 200 });
};
