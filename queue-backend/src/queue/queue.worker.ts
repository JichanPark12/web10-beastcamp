import { Injectable, Inject, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_KEYS, PROVIDERS } from '@beastcamp/shared-constants';

interface RedisWithCommands extends Redis {
  transferUser(
    waitQ: string,
    activeQ: string,
    maxCapacity: number,
    now: string,
  ): Promise<string[]>;
}

@Injectable()
export class QueueWorker {
  private readonly logger = new Logger(QueueWorker.name);
  private isActive = false;
  private MAX_CAPACITY = 10; // 활성 큐 최대 용량

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: RedisWithCommands,
  ) {}

  async processQueueTransfer() {
    if (this.isActive) {
      this.logger.debug('🚫 이미 활성 큐 처리 중입니다.');
      return;
    }

    this.isActive = true;

    try {
      const movedUsers = await this.redis.transferUser(
        REDIS_KEYS.WAITING_QUEUE,
        REDIS_KEYS.ACTIVE_QUEUE,
        this.MAX_CAPACITY,
        Date.now().toString(),
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

    const statusKey = `status:active:${userId}`;

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
