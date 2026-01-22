import { PROVIDERS, REDIS_CHANNELS } from '@beastcamp/shared-constants';
import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import { QueueWorker } from './queue.worker';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class QueueTrigger implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueTrigger.name);
  private subClient: Redis;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly worker: QueueWorker,
  ) {}

  async onModuleInit() {
    this.subClient = this.redis.duplicate();
    await this.subClient.subscribe(REDIS_CHANNELS.QUEUE_EVENT_DONE);

    this.subClient.on('message', (channel: string, message: string) => {
      if (channel === REDIS_CHANNELS.QUEUE_EVENT_DONE) {
        this.logger.log('🔔 티켓팅 완료 메시지 수신 - 즉시 이동 시도');
        void (async () => {
          await this.worker.removeActiveUser(message);
          await this.worker.processQueueTransfer();
        })().catch((err: Error) => {
          this.logger.error(`🚨 [트리거 오류] message: ${message}`, err.stack);
        });
      }
    });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    await this.worker.processQueueTransfer();
  }

  async onModuleDestroy() {
    await this.subClient?.quit();
  }
}
