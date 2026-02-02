import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import { QueueConfigService } from './queue-config.service';
import { TicketingStateService } from './ticketing-state.service';

@Injectable()
export class VirtualUserInjector {
  private readonly logger = new Logger(VirtualUserInjector.name);
  private isRunning = false;
  private timerId: NodeJS.Timeout | null = null;
  private startAt = 0;

  constructor(
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis,
    private readonly configService: QueueConfigService,
    private readonly ticketingStateService: TicketingStateService,
  ) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('가상 유저 주입이 이미 실행 중입니다.');
      return;
    }

    await this.configService.sync();
    const { virtual } = this.configService;

    if (!virtual.enabled) {
      this.logger.warn('가상 유저 주입이 비활성화되어 있습니다.');
      return;
    }

    this.isRunning = true;
    this.startAt = Date.now();

    const rawCount = await this.redis.get(REDIS_KEYS.INJECTOR_STATE);
    const alreadyInjected = this.safeParseNumber(rawCount);

    if (alreadyInjected === 0) {
      const initialCount = Math.floor(
        virtual.targetTotal * virtual.initialJumpRatio,
      );
      if (initialCount > 0) {
        await this.injectBatch(initialCount);
        await this.incrementState(initialCount);
      }
    }

    this.scheduleNextTick();
  }

  private scheduleNextTick(): void {
    if (!this.isRunning) return;
    this.timerId = setTimeout(
      () => void this.runTick(),
      this.configService.virtual.tickIntervalMs,
    );
  }

  private async runTick(): Promise<void> {
    if (!this.isRunning) return;

    const isOpen = await this.ticketingStateService.isOpen();
    if (!isOpen) {
      this.logger.log('⚠️ 티켓팅이 종료되어 가상 유저 주입을 중단합니다.');
      return this.stop();
    }

    try {
      await this.configService.sync();
      const { virtual } = this.configService;
      if (!virtual.enabled) return this.stop();

      const now = Date.now();
      const elapsed = now - this.startAt;
      const burstMs = Math.max(1000, virtual.burstDurationSec * 1000);

      const progress = Math.min(1, elapsed / burstMs);
      const targetAtMoment = Math.floor(virtual.targetTotal * progress);

      const currentInjected = this.safeParseNumber(
        await this.redis.get(REDIS_KEYS.INJECTOR_STATE),
      );
      const currentWaiting = await this.redis.zcard(REDIS_KEYS.WAITING_QUEUE);

      const missingByPlan = targetAtMoment - currentInjected;
      const missingByCapacity = virtual.targetTotal - currentWaiting;
      const injectCount = Math.max(
        0,
        Math.min(missingByPlan, missingByCapacity),
      );

      if (injectCount > 0) {
        await this.injectBatch(injectCount);
        const totalAfterUpdate = await this.incrementState(injectCount);
        if (totalAfterUpdate >= virtual.targetTotal) {
          this.logger.log(
            `✅ 목표 도달로 인한 종료 (Total: ${totalAfterUpdate})`,
          );
          return this.stop();
        }
      }

      if (currentWaiting >= virtual.targetTotal) {
        this.logger.log(
          `⚠️ 대기열 포화로 인한 주입 중단 (Current: ${currentWaiting})`,
        );
        return this.stop();
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`가상 유저 주입 오류: ${err.message}`, err.stack);
    }

    this.scheduleNextTick();
  }

  private async injectBatch(count: number): Promise<void> {
    const { virtual } = this.configService;

    for (let offset = 0; offset < count; offset += virtual.injectBatchSize) {
      const currentBatchSize = Math.min(
        count - offset,
        virtual.injectBatchSize,
      );
      const pipeline = this.redis.pipeline();

      for (let i = 0; i < currentBatchSize; i++) {
        pipeline.zadd(
          REDIS_KEYS.WAITING_QUEUE,
          Date.now() + offset + i,
          this.generateUserId(),
        );
      }

      const results = await pipeline.exec();
      const hasError = results?.some(([err]) => err);
      if (hasError) {
        this.logger.error('대기열 주입 실패', { results });
        throw new Error('waiting queue injection failed');
      }

      if (virtual.injectBatchDelayMs > 0 && offset + currentBatchSize < count) {
        await this.delay(virtual.injectBatchDelayMs);
      }
    }
  }

  private async incrementState(amount: number): Promise<number> {
    const results = await this.redis
      .pipeline()
      .incrby(REDIS_KEYS.INJECTOR_STATE, amount)
      .expire(REDIS_KEYS.INJECTOR_STATE, 86400)
      .exec();
    const [err, value] = results?.[0] ?? [];
    if (err || typeof value !== 'number') {
      this.logger.warn(
        `⚠️ 가상 유저 주입 인원 수 증가 실패: ${err?.message ?? 'invalid value'}`,
      );
      return 0;
    }
    return value;
  }

  private safeParseNumber(val: string | null): number {
    if (!val) return 0;
    const parsed = parseInt(val, 10);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  public stop(): void {
    this.isRunning = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private generateUserId = () => randomBytes(12).toString('base64url');
  private delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
}
