import { isExperienceMode } from "@/lib/utils";

// 서버 타입 정의
export type ServerType = "api" | "ticket" | "queue";

// API 서버 엔드포인트 (Mock 모드 지원)
export const API_PREFIX =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

// 티켓 서버 엔드포인트
export const TICKET_PREFIX =
  process.env.NEXT_PUBLIC_TICKET_SERVER_URL || "http://localhost:3001";

// 큐 서버 엔드포인트
export const QUEUE_PREFIX =
  process.env.NEXT_PUBLIC_QUEUE_SERVER_URL || "http://localhost:3003/api";

// 서버 타입별 URL 반환
export function getServerUrl(
  serverType: ServerType = "api",
  isMockMode?: boolean,
): string {
  // 1. 환경 변수 체크
  if (process.env.NEXT_PUBLIC_API_MODE === "mock") {
    return "/api/mock";
  }

  // 2. 명시적으로 Mock 모드가 전달된 경우 (Cookie 등)
  if (isMockMode) {
    return "/api/mock";
  }

  // 3. (추가) isMockMode가 전달되지 않았지만 클라이언트 환경인 경우 쿠키 확인
  // 이는 request()를 거치지 않은 raw fetch를 위한 안전장치입니다.
  if (typeof window !== "undefined" && isExperienceMode()) {
    return "/api/mock";
  }

  switch (serverType) {
    case "ticket":
      return TICKET_PREFIX;
    case "queue":
      return QUEUE_PREFIX;
    case "api":
      return API_PREFIX;
    default:
      return API_PREFIX;
  }
}
