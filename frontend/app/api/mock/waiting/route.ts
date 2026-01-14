import { NextResponse } from "next/server";

export const MAX_ORDER = 100;
const DECREASE_GAP = 17;
let currentOrder = MAX_ORDER;

/**
 * 현재 대기 순번을 가져오기 위한 Mock API
 */
export function GET() {
  currentOrder -= DECREASE_GAP;

  const mockWaitingOrder = {
    order: currentOrder,
  };

  if (currentOrder <= 0) {
    currentOrder = MAX_ORDER;
  }

  return NextResponse.json(mockWaitingOrder);
}
