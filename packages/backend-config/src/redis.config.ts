import { registerAs } from "@nestjs/config";

export const redisConfig = registerAs("redis", () => ({
  queue: {
    host: process.env.REDIS_QUEUE_HOST || "localhost",
    port: parseInt(process.env.REDIS_QUEUE_PORT || "6379", 10),
    password: process.env.REDIS_QUEUE_PASSWORD,
  },
  ticket: {
    host: process.env.REDIS_TICKET_HOST || "localhost",
    port: parseInt(process.env.REDIS_TICKET_PORT || "6379", 10),
    password: process.env.REDIS_TICKET_PASSWORD,
  },
}));
