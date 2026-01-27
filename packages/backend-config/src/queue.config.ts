import { registerAs } from "@nestjs/config";

export const queueConfig = registerAs("queue", () => ({
  maxCapacity: parseInt(process.env.QUEUE_MAX_CAPACITY || "10", 10),
  heartbeatEnabled: true,
  heartbeatThrottleMs: parseInt(process.env.QUEUE_HEARTBEAT_THROTTLE_MS || "1000", 10),
  heartbeatTimeoutMs: parseInt(process.env.QUEUE_HEARTBEAT_TIMEOUT_MS || "60000", 10),
  heartbeatCacheMaxSize: parseInt(process.env.QUEUE_HEARTBEAT_CACHE_MAX_SIZE || "150000", 10),
  activeTTLMs: parseInt(process.env.QUEUE_ACTIVE_TTL_MS || "300000", 10),
}));