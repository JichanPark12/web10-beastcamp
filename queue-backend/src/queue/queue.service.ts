import { Inject, Injectable } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';

@Injectable()
export class QueueService {
  constructor(@Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis) {}

  // [Public] 비즈니스 로직

  async createQueueEntry(existingToken?: string) {
    if (existingToken) {
      const existingRank = await this._getRank(existingToken);
      if (existingRank !== null) {
        return { userId: existingToken, position: existingRank };
      }
    }
    const userId = this._generateUserId();
    await this._addToWaitingQueue(userId);

    const position = await this._getRank(userId);

    return {
      userId,
      position,
    };
  }

  async getQueuePosition(userId: string | undefined): Promise<number | null> {
    if (!userId) {
      return null;
    }

    return await this._getRank(userId);
  }

  // [Private] 세부 구현

  private _generateUserId() {
    return randomBytes(12).toString('base64url');
  }

  private async _getRank(userId: string) {
    const rank = await this.redis.zrank(REDIS_KEYS.WAITING_QUEUE, userId);
    return rank !== null ? rank + 1 : null;
  }

  private async _addToWaitingQueue(userId: string) {
    const score = Date.now(); // 한국시간 기준
    await this.redis.zadd(REDIS_KEYS.WAITING_QUEUE, 'NX', score, userId);
  }
}
