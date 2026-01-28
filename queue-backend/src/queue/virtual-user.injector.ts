import { Inject, Injectable, Logger } from '@nestjs/common';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { randomBytes } from 'crypto';
import Redis from 'ioredis';

@Injectable()
export class VirtualUserInjector {
  private readonly logger = new Logger(VirtualUserInjector.name);
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor(@Inject(PROVIDERS.REDIS_QUEUE) private readonly redis: Redis) {}

  async start(): Promise<void> {
    if (this.isRunning) {
      this.logger.debug('가상 유저 주입이 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    const config = await this.loadConfig();
    const targetTotal = Math.max(0, config.targetTotal);

    if (targetTotal === 0) {
      this.logger.warn('가상 유저 목표 인원이 0입니다. 주입을 중단합니다.');
      this.isRunning = false;
      return;
    }

    const initialCount = Math.min(
      targetTotal,
      Math.floor(targetTotal * config.initialJumpRatio),
    );
    const burstMs = Math.max(1000, config.burstDurationSec * 1000);
    const startAt = Date.now();
    let injectedCount = 0;

    if (initialCount > 0) {
      await this.injectBatch(initialCount, startAt);
      injectedCount += initialCount;
    }

    let isTickRunning = false;
    this.intervalId = setInterval(() => {
      if (isTickRunning) return;
      isTickRunning = true;
      void (async () => {
        const now = Date.now();
        const elapsed = now - startAt;
        const progress = Math.min(1, elapsed / burstMs);
        const targetAtMoment = Math.max(
          initialCount,
          Math.floor(targetTotal * progress),
        );

        const waitingCount = await this.redis.zcard(REDIS_KEYS.WAITING_QUEUE);
        const missing = targetAtMoment - waitingCount;
        const remainingQuota = targetTotal - injectedCount;
        const injectCount = Math.min(missing, remainingQuota);

        if (injectCount > 0) {
          await this.injectBatch(injectCount, now);
          injectedCount += injectCount;
        }

        if (
          elapsed >= burstMs ||
          waitingCount >= targetTotal ||
          injectedCount >= targetTotal
        ) {
          this.stopScheduler();
        }
      })()
        .catch((error: unknown) => {
          const err =
            error instanceof Error ? error : new Error('Unknown error');
          this.logger.error(`가상 유저 주입 오류: ${err.message}`, err.stack);
        })
        .finally(() => {
          isTickRunning = false;
        });
    }, 1000);
  }

  private stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  private async loadConfig() {
    const raw = await this.redis.hgetall('queue:config');
    const targetTotal = Number(raw.target_total ?? 1000);
    const initialJumpRatio = Number(raw.initial_jump_ratio ?? 0.3);
    const burstDurationSec = Number(raw.burst_duration ?? 30);

    return {
      targetTotal: Number.isFinite(targetTotal) ? targetTotal : 1000,
      initialJumpRatio: Number.isFinite(initialJumpRatio)
        ? Math.min(1, Math.max(0, initialJumpRatio))
        : 0.3,
      burstDurationSec: Number.isFinite(burstDurationSec)
        ? Math.max(1, burstDurationSec)
        : 30,
    };
  }

  private async injectBatch(count: number, now: number): Promise<void> {
    const pipeline = this.redis.pipeline();

    for (let i = 0; i < count; i += 1) {
      const userId = this.generateUserId();
      const score = now + i;
      pipeline.zadd(REDIS_KEYS.WAITING_QUEUE, score, userId);
    }

    await pipeline.exec();
  }

  private generateUserId() {
    return randomBytes(12).toString('base64url');
  }
}
