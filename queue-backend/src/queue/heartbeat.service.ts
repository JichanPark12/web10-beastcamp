import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { QueueConfigService } from './queue-config.service';
import { QUEUE_ERROR_CODES, QueueException } from '@beastcamp/shared-nestjs';

@Injectable()
export class HeartbeatService {
  private readonly logger = new Logger(HeartbeatService.name);
  private readonly heartbeatCache = new Map<string, number>();

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly configService: QueueConfigService,
  ) {}

  async update(userId: string): Promise<void> {
    const { heartbeat } = this.configService;

    if (!heartbeat.enabled) {
      return;
    }

    const now = Date.now();
    const lastUpdate = this.heartbeatCache.get(userId);

    if (lastUpdate && now - lastUpdate < heartbeat.throttleMs) {
      return;
    }

    try {
      await this.redis.zadd(REDIS_KEYS.HEARTBEAT_QUEUE, now, userId);

      this.heartbeatCache.set(userId, now);

      if (this.heartbeatCache.size > heartbeat.cacheMaxSize) {
        this.heartbeatCache.clear();
        this.logger.debug('캐시 최대치 도달로 초기화');
      }
    } catch (error) {
      // 💡 NOTE: 하트비트 업데이트는 부수적인 작업이므로 실패가 메인 로직(조회)에 영향을 주지 않도록 함.
      // 실패 시 에러를 던지지 않고 로그만 남겨 관측성을 유지함.
      const wrappedError =
        error instanceof QueueException
          ? error
          : new QueueException(
              QUEUE_ERROR_CODES.QUEUE_HEARTBEAT_UPDATE_FAILED,
              '하트비트 업데이트에 실패했습니다.',
              500,
            );
      this.logger.error(
        wrappedError.message,
        error instanceof Error ? error.stack : undefined,
        {
          errorCode: wrappedError.errorCode,
          userId,
        },
      );
    }
  }
}
