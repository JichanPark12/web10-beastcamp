import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  REDIS_KEYS,
  PROVIDERS,
  REDIS_KEY_PREFIXES,
} from '@beastcamp/shared-constants';
import { ConfigService } from '@nestjs/config';

interface RedisWithCommands extends Redis {
  syncAndPromoteWaiters(
    waitQ: string,
    activeQ: string,
    heartbeatQ: string,
    maxCapacity: number,
    now: number,
    heartbeatTimeoutMs: number,
    activeTTLMs: number,
    activeUserPrefix: string,
    heartbeatEnabled: boolean,
  ): Promise<string[]>;
}

@Injectable()
export class QueueWorker {
  private readonly logger = new Logger(QueueWorker.name);
  private readonly maxCapacity: number;
  private readonly heartbeatTimeoutMs: number;
  private readonly activeTTLMs: number;
  private readonly heartbeatEnabled: boolean;
  private isActive = false;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: RedisWithCommands,
    private readonly configService: ConfigService,
  ) {
    this.maxCapacity =
      this.configService.get<number>('queue.maxCapacity') || 10;
    this.heartbeatTimeoutMs =
      this.configService.get<number>('queue.heartbeatTimeoutMs') || 60000;
    this.activeTTLMs =
      this.configService.get<number>('queue.activeTTLMs') || 300000;
    this.heartbeatEnabled =
      this.configService.get<boolean>('queue.heartbeatEnabled') ?? true;
  }

  async processQueueTransfer() {
    if (this.isActive) {
      this.logger.debug('🚫 이미 활성 큐 처리 중입니다.');
      return;
    }

    this.isActive = true;

    try {
      const movedUsers = await this.redis.syncAndPromoteWaiters(
        REDIS_KEYS.WAITING_QUEUE,
        REDIS_KEYS.ACTIVE_QUEUE,
        REDIS_KEYS.HEARTBEAT_QUEUE,
        this.maxCapacity,
        Date.now(),
        this.heartbeatTimeoutMs,
        this.activeTTLMs,
        REDIS_KEY_PREFIXES.ACTIVE_USER,
        this.heartbeatEnabled,
      );

      if (movedUsers.length > 0) {
        this.logger.log(
          `🚀 [입장] 유저 ${movedUsers.join(', ')}님이 활성 큐로 이동했습니다.`,
        );
      }
    } catch (error) {
      this.logger.error('대기열 스케줄링 중 오류 발생:', error);
    }

    this.isActive = false;
  }

  async removeActiveUser(userId: string) {
    if (!userId) {
      return;
    }

    const statusKey = `${REDIS_KEY_PREFIXES.ACTIVE_USER}${userId}`;

    try {
      const removed = await this.redis.zrem(REDIS_KEYS.ACTIVE_QUEUE, userId);
      await this.redis.del(statusKey);

      if (removed > 0) {
        this.logger.log(
          `🛑 [퇴장] 유저 ${userId}님을 활성 큐에서 제거했습니다.`,
        );
      }
    } catch (error) {
      this.logger.error('활성 큐 제거 중 오류 발생:', error);
    }
  }
}
