import fs from "fs/promises";
export const GET = async () => {
  const reservations = await fs.readFile(
    "app/api/mock/nol-reservations/data.json",
    "utf-8",
  );
  return Response.json(JSON.parse(reservations), { status: 200 });
};
