import { Inject, Injectable } from '@nestjs/common';
import {
  PROVIDERS,
  REDIS_KEYS,
  REDIS_KEY_PREFIXES,
} from '@beastcamp/shared-constants';
import { Redis } from 'ioredis';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import {
  QueueEntryResponse,
  QueueStatusResponse,
} from '@beastcamp/shared-types';
import { HeartbeatService } from './heartbeat.service';

@Injectable()
export class QueueService {
  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly jwtService: JwtService,
    private readonly heartbeatService: HeartbeatService,
  ) {}

  /**
   * [Public] 대기열 진입
   * - 기존 유저인지 확인 후, 아니면 신규 생성 및 하트비트 초기화
   */
  async createEntry(userId?: string): Promise<QueueEntryResponse> {
    // 1. 기존 유저 확인
    if (userId) {
      const position = await this.getPosition(userId);
      if (position) {
        return { userId, position };
      }
    }

    // 2. 신규 유저 생성
    const newUserId = this.generateUserId();

    // 3. 유저 진입 (진입 시 하트비트도 동시에 등록)
    await this.registerUser(newUserId);

    return {
      userId: newUserId,
      position: await this.getPosition(newUserId),
    };
  }

  /**
   * [Public] 상태 확인 및 토큰 발행
   */
  async getStatus(userId: string | undefined): Promise<QueueStatusResponse> {
    if (!userId) {
      return { position: null };
    }

    // 1. 활성 상태 확인
    const isActive = await this.checkActiveStatus(userId);

    if (isActive) {
      const token = await this.generateAccessToken(userId);
      return { token, position: 0 };
    }

    // 2. 대기 순번 확인
    const position = await this.getPosition(userId);

    // 3. 대기 중인 유저라면 하트비트 갱신
    if (position !== null) {
      await this.updateHeartbeat(userId);
    }

    return { position };
  }

  // [Private] 세부 구현

  private generateUserId() {
    return randomBytes(12).toString('base64url');
  }

  private async getPosition(userId: string) {
    const rank = await this.redis.zrank(REDIS_KEYS.WAITING_QUEUE, userId);
    return rank !== null ? rank + 1 : null;
  }

  private async registerUser(userId: string) {
    const score = Date.now(); // 한국시간 기준
    await this.redis
      .multi()
      .zadd(REDIS_KEYS.WAITING_QUEUE, 'NX', score, userId)
      .zadd(REDIS_KEYS.HEARTBEAT_QUEUE, 'NX', score, userId)
      .exec();
  }

  private async checkActiveStatus(userId: string) {
    const activeUserKey = `${REDIS_KEY_PREFIXES.ACTIVE_USER}${userId}`;
    if (!activeUserKey) {
      return false;
    }
    const exists = await this.redis.exists(activeUserKey);
    return exists > 0;
  }

  private async generateAccessToken(userId: string) {
    const payload = {
      sub: userId,
      type: 'TICKETING',
    };

    return this.jwtService.signAsync(payload);
  }

  private async updateHeartbeat(userId: string) {
    await this.heartbeatService.update(userId);
  }
}
