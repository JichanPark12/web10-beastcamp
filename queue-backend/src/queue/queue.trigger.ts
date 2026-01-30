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
import { QueueConfigService } from './queue-config.service';

@Injectable()
export class QueueTrigger implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueTrigger.name);
  private subClient: Redis;
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly worker: QueueWorker,
    private readonly configService: QueueConfigService,
  ) {}

  async onModuleInit() {
    this.isRunning = true;
    this.subClient = this.redis.duplicate();
    await this.subClient.subscribe(REDIS_CHANNELS.QUEUE_EVENT_DONE);

    this.subClient.on('message', (channel: string, message: string) => {
      if (channel === REDIS_CHANNELS.QUEUE_EVENT_DONE) {
        void this.handleDoneEvent(message);
      }
    });

    void this.runTransferCycle();
  }

  private scheduleNextTransfer(): void {
    if (!this.isRunning) {
      return;
    }

    const intervalSec = this.configService.worker.transferIntervalSec;
    const delayMs = intervalSec * 1000;

    this.timer = setTimeout(() => {
      void this.runTransferCycle();
    }, delayMs);
  }

  private async runTransferCycle(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      await this.configService.sync();
      await this.worker.processQueueTransfer();
    } catch (error) {
      this.logger.error('대기열 스케줄링 중 오류 발생:', error);
    } finally {
      this.scheduleNextTransfer();
    }
  }

  private async handleDoneEvent(message: string) {
    try {
      this.logger.log(`🔔 티켓팅 완료 메시지 수신: ${message}`);
      await this.worker.removeActiveUser(message);
      await this.worker.processQueueTransfer();
    } catch (err) {
      this.logger.error(
        `🚨 [트리거 오류] message: ${message}`,
        (err as Error).stack,
      );
    }
  }

  async onModuleDestroy() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    await this.subClient?.quit();
  }
}
