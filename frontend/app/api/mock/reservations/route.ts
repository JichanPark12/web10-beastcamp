import { NextRequest, NextResponse } from "next/server";
import reservationData from "./new-data.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get("session_id");
  const blockId = searchParams.get("block_id");

  if (!sessionId || isNaN(+sessionId)) {
    return Response.json({ error: "Session ID is required" }, { status: 400 });
  }
  const sessionNum = +sessionId;
  if (sessionNum < 1 || sessionNum > 6) {
    return Response.json({ error: "Invalid Session ID" }, { status: 400 });
  }

  if (blockId) {
    if (isNaN(+blockId)) {
      return Response.json({ error: "Block ID is required" }, { status: 400 });
    }
    const blockData = (reservationData as Record<string, boolean[][]>)[blockId];
    if (!blockData) {
      return Response.json({ error: "Invalid Block ID" }, { status: 404 });
    }
    return Response.json({ seats: blockData });
  }

  return Response.json({ seats: reservationData });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session_id, seats } = body;

    if (!session_id || !seats || !Array.isArray(seats)) {
      return NextResponse.json(
        { message: "올바르지 않은 요청입니다." },
        { status: 400 },
      );
    }

    const rank = Math.floor(Math.random() * 100) + 1;

    return NextResponse.json({
      rank,
      seats: seats,
    });
  } catch {
    return NextResponse.json({ message: "서버 에러" }, { status: 500 });
  }
}
