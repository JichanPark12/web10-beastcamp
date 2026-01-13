import { Inject, Injectable } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';

@Injectable()
export class QueueService {
  constructor(@Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis) {}

  async createQueueEntry(existingToken?: string) {
    if (existingToken) {
      const existingRank = await this.redis.zrank(
        REDIS_KEYS.WAITING_QUEUE,
        existingToken,
      );
      if (existingRank !== null) {
        return { userId: existingToken, position: existingRank + 1 };
      }
    }
    const userId = randomBytes(12).toString('base64url');
    const score = Date.now();
    await this.redis.zadd(REDIS_KEYS.WAITING_QUEUE, 'NX', score, userId);

    console.log('REDIS_KEYS', REDIS_KEYS);
    console.log('WAITING_QUEUE', REDIS_KEYS?.WAITING_QUEUE);
    const rank = await this.redis.zrank(REDIS_KEYS.WAITING_QUEUE, userId);

    return {
      userId,
      position: rank !== null ? rank + 1 : null,
    };
  }

  async getQueuePosition(userId: string | undefined): Promise<number | null> {
    if (!userId) {
      return null;
    }

    const rank = await this.redis.zrank(REDIS_KEYS.WAITING_QUEUE, userId);

    if (rank === null) {
      return null;
    }

    return rank + 1;
  }
}
