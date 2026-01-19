import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { PROVIDERS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject(PROVIDERS.REDIS_TICKET)
    private readonly client: Redis,
  ) {}

  onModuleDestroy() {
    this.client.disconnect();
  }

  async setNx(key: string, value: string): Promise<boolean> {
    const result = await this.client.setnx(key, value);
    return result === 1;
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async flushAll(): Promise<string> {
    return this.client.flushall();
  }
}
