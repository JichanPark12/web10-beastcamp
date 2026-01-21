// 현재 사용하지 않는 nol 신버전 관련 코드
import fs from "fs/promises";
export const GET = async () => {
  const reservations = await fs.readFile(
    "app/api/mock/reservations/data.json",
    "utf-8"
  );
  return Response.json(JSON.parse(reservations), { status: 200 });
};
