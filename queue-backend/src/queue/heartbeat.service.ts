import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class HeartbeatService {
  private readonly heartbeatCache = new Map<string, number>();
  private readonly isEnabled: boolean;
  private readonly throttleMs: number;
  private readonly heartbeatCacheMaxSize: number;

  constructor(
    private readonly configService: ConfigService,
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
  ) {
    this.isEnabled =
      this.configService.get<boolean>('queue.heartbeatEnabled') ?? true;
    this.throttleMs =
      this.configService.get<number>('queue.heartbeatThrottleMs') || 1000;
    this.heartbeatCacheMaxSize =
      this.configService.get<number>('queue.heartbeatCacheMaxSize') || 150000;
  }

  async update(userId: string): Promise<void> {
    if (!this.isEnabled) return;

    const now = Date.now();
    const lastUpdate = this.heartbeatCache.get(userId);

    if (lastUpdate && now - lastUpdate < this.throttleMs) {
      return;
    }

    await this.redis.zadd(REDIS_KEYS.HEARTBEAT_QUEUE, now, userId);
    this.heartbeatCache.set(userId, now);

    if (this.heartbeatCache.size > this.heartbeatCacheMaxSize) {
      this.heartbeatCache.clear();
    }
  }
}
