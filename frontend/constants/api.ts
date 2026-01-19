// 서버 타입 정의
export type ServerType = 'api' | 'ticket';

// API 서버 URL
const API_BASE_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_API_URL
    : process.env.NEXT_PUBLIC_API_URL;

// 티켓 서버 URL
const TICKET_BASE_URL =
  typeof window === 'undefined'
    ? process.env.INTERNAL_TICKET_SERVER_URL
    : process.env.NEXT_PUBLIC_TICKET_SERVER_URL;

// API 서버 엔드포인트 (Mock 모드 지원)
export const API_PREFIX =
  process.env.NEXT_PUBLIC_API_MODE === 'mock'
    ? `localhost:3000/mock`
    : API_BASE_URL;

// 티켓 서버 엔드포인트
export const TICKET_PREFIX = TICKET_BASE_URL;

// 서버 타입별 URL 반환
export function getServerUrl(serverType: ServerType = 'api'): string {
  switch (serverType) {
    case 'ticket':
      return TICKET_PREFIX || 'http://localhost:3001';
    case 'api':
    default:
      return API_PREFIX || 'http://localhost:3002/api';
  }
}
