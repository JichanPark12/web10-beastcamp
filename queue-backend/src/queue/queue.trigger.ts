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
import {
  QUEUE_ERROR_CODES,
  QueueException,
  runWithPubSubContext,
  TraceService,
} from '@beastcamp/shared-nestjs';

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
          this.handleDoneEvent(payload.userId, Boolean(payload.isVirtual)),
        );
      }
    });

    void this.traceService.runWithTraceId(
      this.traceService.generateTraceId(),
      () => this.runTransferCycle(),
    );
  }

  private scheduleNextTransfer(): void {
    if (!this.isRunning) {
      return;
    }

    const intervalSec = this.configService.worker.transferIntervalSec;
    const delayMs = intervalSec * 1000;

    this.timer = setTimeout(() => {
      void this.traceService.runWithTraceId(
        this.traceService.generateTraceId(),
        () => this.runTransferCycle(),
      );
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
        wrappedError.message,
        error instanceof Error ? error.stack : undefined,
        {
          errorCode: wrappedError.errorCode,
        },
      );
    } finally {
      this.scheduleNextTransfer();
    }
  }

  private async handleDoneEvent(userId: string, isVirtual: boolean) {
    try {
      const samplingRate = isVirtual ? 0.01 : 1.0;
      if (Math.random() < samplingRate) {
        this.logger.log(`🔔 티켓팅 완료 수신`, {
          userId,
          isVirtual,
          sampled: isVirtual,
        });
      }
      await this.worker.removeActiveUser(userId, isVirtual);
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
        wrappedError.message,
        err instanceof Error ? err.stack : undefined,
        {
          errorCode: wrappedError.errorCode,
          userId,
        },
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
