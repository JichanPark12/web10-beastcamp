import { NextResponse } from "next/server";

export const MAX_ORDER = 100;

export function POST() {
  const mockWaitingOrder = {
    userId: "test-user-id",
    position: MAX_ORDER,
  };

  return NextResponse.json(mockWaitingOrder);
}
