// 서버 타입 정의
export type ServerType = 'api' | 'ticket';

// API 서버 엔드포인트 (Mock 모드 지원)
export const API_PREFIX =
  process.env.NEXT_PUBLIC_API_MODE === 'mock'
    ? 'localhost:3000/mock'
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

// 티켓 서버 엔드포인트
export const TICKET_PREFIX =
  process.env.NEXT_PUBLIC_TICKET_SERVER_URL || 'http://localhost:3001';

// 서버 타입별 URL 반환
export function getServerUrl(serverType: ServerType = 'api'): string {
  switch (serverType) {
    case 'ticket':
      return TICKET_PREFIX;
    case 'api':
    default:
      return API_PREFIX;
  }
}
