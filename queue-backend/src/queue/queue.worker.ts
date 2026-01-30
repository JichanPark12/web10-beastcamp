import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import {
  REDIS_KEYS,
  PROVIDERS,
  REDIS_KEY_PREFIXES,
} from '@beastcamp/shared-constants';
import { QueueConfigService } from './queue-config.service';

interface RedisWithCommands extends Redis {
  syncAndPromoteWaiters(
    waitQ: string,
    activeQ: string,
    heartbeatQ: string,
    virtualActiveQ: string,
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
  private isProcessing = false;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: RedisWithCommands,
    private readonly configService: QueueConfigService,
  ) {}

  async processQueueTransfer() {
    if (this.isProcessing) {
      this.logger.debug('🚫 이미 활성 큐 처리 중입니다.');
      return;
    }

    this.isProcessing = true;

    try {
      const { worker, heartbeat } = this.configService;

      const movedUsers = await this.redis.syncAndPromoteWaiters(
        REDIS_KEYS.WAITING_QUEUE,
        REDIS_KEYS.ACTIVE_QUEUE,
        REDIS_KEYS.HEARTBEAT_QUEUE,
        REDIS_KEYS.VIRTUAL_ACTIVE_QUEUE,
        worker.maxCapacity,
        Date.now(),
        worker.heartbeatTimeoutMs,
        worker.activeTTLMs,
        REDIS_KEY_PREFIXES.ACTIVE_USER,
        heartbeat.enabled,
      );

      if (movedUsers.length > 0) {
        this.logger.log(
          `🚀 [입장] 유저 ${movedUsers.join(', ')}님이 활성 큐로 이동했습니다.`,
        );
      }
    } catch (error) {
      this.logger.error('대기열 스케줄링 중 오류 발생:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  async removeActiveUser(userId: string) {
    if (!userId) {
      return;
    }

    const statusKey = `${REDIS_KEY_PREFIXES.ACTIVE_USER}${userId}`;

    try {
      const results = await this.redis
        .pipeline()
        .zrem(REDIS_KEYS.ACTIVE_QUEUE, userId)
        .del(statusKey)
        .exec();

      const removed = (results?.[0]?.[1] as number) ?? 0;
      if (removed > 0) {
        this.logger.log(
          `🛑 [퇴장] 유저 ${userId}님을 활성 큐에서 제거했습니다.`,
        );
      }
    } catch (error) {
      this.logger.error(`활성 큐 제거 실패 (userId: ${userId}):`, error);
    }
  }
}
