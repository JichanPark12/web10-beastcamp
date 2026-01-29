import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';
import {
  getQueueBooleanField,
  getQueueNumberField,
  seedQueueBooleanField,
  seedQueueNumberField,
} from './queue-config.util';

@Injectable()
export class VirtualUserInjector implements OnModuleInit {
  private readonly logger = new Logger(VirtualUserInjector.name);
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;
  private startAt = 0;
  private targetTotal = 0;
  private initialCount = 0;
  private burstMs = 0;
  private injectedCount = 0;

  constructor(@Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis) {}

  async onModuleInit(): Promise<void> {
    await this.seedVirtualConfig();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('가상 유저 주입이 이미 실행 중입니다.');
      return;
    }
    this.isRunning = true;

    await this.seedVirtualConfig();

    const isEnabled = await this.isVirtualUserEnabled();
    if (!isEnabled) {
      this.logger.warn('가상 유저 주입이 비활성화되어 있습니다.');
      this.isRunning = false;
      return;
    }

    let config: {
      targetTotal: number;
      initialJumpRatio: number;
      burstDurationSec: number;
    };
    try {
      config = await this.loadConfig();
    } catch (error: unknown) {
      this.isRunning = false;
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`가상 유저 설정 로드 실패: ${err.message}`, err.stack);
      throw err;
    }
    this.targetTotal = Math.max(0, config.targetTotal);

    if (this.targetTotal === 0) {
      this.logger.warn('가상 유저 목표 인원이 0입니다. 주입을 중단합니다.');
      this.isRunning = false;
      return;
    }

    this.initialCount = Math.min(
      this.targetTotal,
      Math.floor(this.targetTotal * config.initialJumpRatio),
    );
    this.burstMs = Math.max(1000, config.burstDurationSec * 1000);
    this.startAt = Date.now();
    this.injectedCount = 0;

    if (this.initialCount > 0) {
      await this.injectBatch(this.initialCount, this.startAt);
      this.injectedCount += this.initialCount;
    }

    await this.scheduleNextTick();
  }

  private stopScheduler() {
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async scheduleNextTick(): Promise<void> {
    if (!this.isRunning) return;
    const intervalMs = await getQueueNumberField(
      this.redis,
      'virtual.tick_interval_ms',
      1000,
      { min: 100 },
    );

    this.intervalId = setTimeout(() => {
      void this.runTick();
    }, intervalMs);
  }

  private async runTick(): Promise<void> {
    if (!this.isRunning) return;

    try {
      const now = Date.now();
      const elapsed = now - this.startAt;
      const progress = Math.min(1, elapsed / this.burstMs);
      const targetAtMoment = Math.max(
        this.initialCount,
        Math.floor(this.targetTotal * progress),
      );

      const enabledNow = await this.isVirtualUserEnabled();
      if (!enabledNow) {
        this.logger.warn('가상 유저 주입이 비활성화되어 중단합니다.');
        this.stopScheduler();
        return;
      }

      const waitingCount = await this.redis.zcard(REDIS_KEYS.WAITING_QUEUE);
      const missing = targetAtMoment - waitingCount;
      const remainingQuota = this.targetTotal - this.injectedCount;
      const injectCount = Math.min(missing, remainingQuota);

      if (injectCount > 0) {
        await this.injectBatch(injectCount, now);
        this.injectedCount += injectCount;
      }

      if (
        elapsed >= this.burstMs ||
        waitingCount >= this.targetTotal ||
        this.injectedCount >= this.targetTotal
      ) {
        this.stopScheduler();
        return;
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`가상 유저 주입 오류: ${err.message}`, err.stack);
    }

    await this.scheduleNextTick();
  }

  private async loadConfig() {
    const targetTotal = await getQueueNumberField(
      this.redis,
      'virtual.target_total',
      1000,
      { min: 0 },
    );
    const initialJumpRatio = await getQueueNumberField(
      this.redis,
      'virtual.initial_jump_ratio',
      0.3,
      { min: 0, max: 1 },
    );
    const burstDurationSec = await getQueueNumberField(
      this.redis,
      'virtual.burst_duration_sec',
      30,
      { min: 1 },
    );

    return {
      targetTotal,
      initialJumpRatio,
      burstDurationSec,
    };
  }

  private async isVirtualUserEnabled(): Promise<boolean> {
    return getQueueBooleanField(this.redis, 'virtual.enabled', true);
  }

  private async seedVirtualConfig(): Promise<void> {
    await seedQueueNumberField(
      this.redis,
      'virtual.target_total',
      undefined,
      1000,
    );
    await seedQueueNumberField(
      this.redis,
      'virtual.initial_jump_ratio',
      undefined,
      0.3,
    );
    await seedQueueNumberField(
      this.redis,
      'virtual.burst_duration_sec',
      undefined,
      30,
    );
    await seedQueueNumberField(
      this.redis,
      'virtual.inject_batch_size',
      undefined,
      50,
    );
    await seedQueueNumberField(
      this.redis,
      'virtual.inject_batch_delay_ms',
      undefined,
      0,
    );
    await seedQueueBooleanField(this.redis, 'virtual.enabled', undefined, true);
    await seedQueueNumberField(
      this.redis,
      'virtual.tick_interval_ms',
      undefined,
      1000,
    );
  }

  private async injectBatch(count: number, now: number): Promise<void> {
    const batchSize = await getQueueNumberField(
      this.redis,
      'virtual.inject_batch_size',
      50,
      { min: 1 },
    );
    const batchDelayMs = await getQueueNumberField(
      this.redis,
      'virtual.inject_batch_delay_ms',
      0,
      { min: 0 },
    );

    for (let offset = 0; offset < count; offset += batchSize) {
      const pipeline = this.redis.pipeline();
      const end = Math.min(offset + batchSize, count);

      for (let i = offset; i < end; i += 1) {
        const userId = this.generateUserId();
        const score = now + i;
        pipeline.zadd(REDIS_KEYS.WAITING_QUEUE, score, userId);
      }

      const results = await pipeline.exec();
      if (!results) {
        throw new Error('가상 유저 주입 파이프라인이 중단되었습니다.');
      }
      for (const [err] of results) {
        if (err) throw err;
      }

      if (batchDelayMs > 0 && end < count) {
        await this.delay(batchDelayMs);
      }
    }
  }

  private generateUserId() {
    return randomBytes(12).toString('base64url');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
