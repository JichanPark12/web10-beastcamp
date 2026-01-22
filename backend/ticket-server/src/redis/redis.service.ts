import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PROVIDERS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(PROVIDERS.REDIS_TICKET)
    private readonly ticketClient: Redis,
    @Inject(PROVIDERS.REDIS_QUEUE)
    private readonly queueClient: Redis,
  ) {}

  onModuleDestroy() {
    this.ticketClient.disconnect();
    this.queueClient.disconnect();
  }

  async setNx(key: string, value: string): Promise<boolean> {
    const result = await this.ticketClient.setnx(key, value);
    return result === 1;
  }

  async setNxWithTtl(
    key: string,
    value: string,
    ttlMs: number,
  ): Promise<boolean> {
    const result = await this.ticketClient.set(key, value, 'PX', ttlMs, 'NX');
    return result === 'OK';
  }

  async set(key: string, value: string): Promise<string> {
    return this.ticketClient.set(key, value);
  }

  async get(key: string): Promise<string | null> {
    return this.ticketClient.get(key);
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    if (keys.length === 0) return [];
    return this.ticketClient.mget(...keys);
  }

  async del(key: string): Promise<number> {
    return this.ticketClient.del(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.ticketClient.sadd(key, ...members);
  }

  async incr(key: string): Promise<number> {
    return this.ticketClient.incr(key);
  }

  async sismember(key: string, member: string): Promise<boolean> {
    const result = await this.ticketClient.sismember(key, member);
    return result === 1;
  }

  async flushAll(): Promise<string> {
    return this.ticketClient.flushall();
  }

  async publishToQueue(channel: string, message: string): Promise<number> {
    return this.queueClient.publish(channel, message);
  }
}
