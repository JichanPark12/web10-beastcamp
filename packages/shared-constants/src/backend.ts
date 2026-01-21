// NestJS Provider 토큰
export const PROVIDERS = {
  // 대기열 Redis 클라이언트
  REDIS_QUEUE: "REDIS_QUEUE_CLIENT",
  // 티켓 예매 Redis 클라이언트
  REDIS_TICKET: "REDIS_TICKET_CLIENT",
};

// Redis Key 패턴
export const REDIS_KEYS = {
  // 대기 큐
  WAITING_QUEUE: "queue:waiting",
  // 활성 큐
  ACTIVE_QUEUE: "queue:active",
  // 하트비트 큐
  HEARTBEAT_QUEUE: "queue:heartbeat",
};

export const REDIS_KEY_PREFIXES = {
  ACTIVE_USER: "queue:active:user:",
};

export const REDIS_CHANNELS = {
  QUEUE_EVENT_DONE: "queue:event:done",
};

// ConfigService 경로
export const CONFIG_PATHS = {
  REDIS_QUEUE_HOST: "redis.queue.host",
  REDIS_QUEUE_PORT: "redis.queue.port",
  REDIS_QUEUE_PASSWORD: "redis.queue.password",
  REDIS_TICKET_HOST: "redis.ticket.host",
  REDIS_TICKET_PORT: "redis.ticket.port",
  REDIS_TICKET_PASSWORD: "redis.ticket.password",
};
