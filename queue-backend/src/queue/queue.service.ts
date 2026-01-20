import { Inject, Injectable } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';

export interface QueueStatus {
  token?: string;
  position: number | null;
}
@Injectable()
export class QueueService {
  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly jwtService: JwtService,
  ) {}

  // [Public] 비즈니스 로직

  async createQueueEntry(existingToken?: string) {
    if (existingToken) {
      const existingPosition = await this._getPosition(existingToken);
      if (existingPosition !== null) {
        return { userId: existingToken, position: existingPosition };
      }
    }
    const userId = this._generateUserId();
    await this._addToWaitingQueue(userId);

    const position = await this._getPosition(userId);

    return {
      userId,
      position,
    };
  }

  async getQueuePosition(userId: string | undefined): Promise<QueueStatus> {
    if (!userId) {
      return { position: null };
    }

    const isActive = await this._isActive(userId);
    if (!isActive) {
      const position = await this._getPosition(userId);

      return { position };
    }

    const payload = {
      sub: userId,
      type: 'TICKETING',
    };

    const token = await this.jwtService.signAsync(payload);

    return { token, position: 0 };
  }

  // [Private] 세부 구현

  private _generateUserId() {
    return randomBytes(12).toString('base64url');
  }

  private async _getPosition(userId: string) {
    const rank = await this.redis.zrank(REDIS_KEYS.WAITING_QUEUE, userId);
    return rank !== null ? rank + 1 : null;
  }

  private async _addToWaitingQueue(userId: string) {
    const score = Date.now(); // 한국시간 기준
    await this.redis.zadd(REDIS_KEYS.WAITING_QUEUE, 'NX', score, userId);
  }

  private async _isActive(userId: string) {
    const isActive = await this.redis.exists(`status:active:${userId}`);
    return isActive > 0;
  }
}
