import { Inject, Injectable, Logger, ForbiddenException } from '@nestjs/common';
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
import { VirtualUserInjector } from './virtual-user.injector';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private localStartedFlag = false;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    @Inject(PROVIDERS.REDIS_TICKET) private readonly ticketRedis: Redis,
    private readonly jwtService: JwtService,
    private readonly heartbeatService: HeartbeatService,
    private readonly virtualUserInjector: VirtualUserInjector,
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

    await this.validateTicketingOpen();

    // 2. 신규 유저 생성
    const newUserId = this.generateUserId();

    // 3. 유저 진입 (진입 시 하트비트도 동시에 등록)
    await this.registerUser(newUserId);
    await this.ensureVirtualInjectionStarted();

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

  private async ensureVirtualInjectionStarted() {
    if (this.localStartedFlag) {
      return;
    }

    this.localStartedFlag = true;

    try {
      const started = await this.redis.setnx('queue:started', Date.now());
      if (started === 1) {
        await this.virtualUserInjector.start();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`가상 유저 시작 체크 실패: ${err.message}`, err.stack);
    }
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

  private async validateTicketingOpen() {
    const isOpen = await this.ticketRedis.get(
      String(REDIS_KEYS.TICKETING_OPEN),
    );
    if (isOpen !== 'true') {
      throw new ForbiddenException('Ticketing not open');
    }
  }
}
