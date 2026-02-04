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
import { runWithPubSubContext } from '@beastcamp/shared-nestjs/trace/pubsub-context';
import { TraceService } from '@beastcamp/shared-nestjs/trace/trace.service';
import { QUEUE_ERROR_CODES, QueueException } from '@beastcamp/shared-nestjs';

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
    private readonly traceService: TraceService,
  ) {}

  async onModuleInit() {
    this.isRunning = true;
    this.subClient = this.redis.duplicate();
    await this.subClient.subscribe(REDIS_CHANNELS.QUEUE_EVENT_DONE);

    this.subClient.on('message', (channel: string, message: string) => {
      if (channel === REDIS_CHANNELS.QUEUE_EVENT_DONE) {
        void runWithPubSubContext(this.traceService, message, (payload) =>
          this.handleDoneEvent(payload.userId),
        );
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
      const wrappedError =
        error instanceof QueueException
          ? error
          : new QueueException(
              QUEUE_ERROR_CODES.QUEUE_TRIGGER_FAILED,
              '대기열 스케줄링 중 오류가 발생했습니다.',
              500,
            );
      this.logger.error(
        `[${wrappedError.errorCode}] ${wrappedError.message}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      this.scheduleNextTransfer();
    }
  }

  private async handleDoneEvent(userId: string) {
    try {
      this.logger.log(`🔔 티켓팅 완료 메시지 수신: ${userId}`);
      await this.worker.removeActiveUser(userId);
      await this.worker.processQueueTransfer();
    } catch (err) {
      const wrappedError =
        err instanceof QueueException
          ? err
          : new QueueException(
              QUEUE_ERROR_CODES.QUEUE_DONE_EVENT_FAILED,
              '티켓팅 완료 이벤트 처리 중 오류가 발생했습니다.',
              500,
            );
      this.logger.error(
        `[${wrappedError.errorCode}] ${wrappedError.message}`,
        err instanceof Error ? err.stack : undefined,
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
