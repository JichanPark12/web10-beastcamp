import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DynamicConfigManager } from '@beastcamp/backend-config';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { ChainableCommander, Redis } from 'ioredis';

@Injectable()
export class TicketConfigService implements OnModuleInit {
  private readonly logger = new Logger(TicketConfigService.name);
  private readonly ticketManager: DynamicConfigManager;
  private readonly queueManager: DynamicConfigManager;

  constructor(
    @Inject(PROVIDERS.REDIS_TICKET) private readonly ticketRedis: Redis,
    @Inject(PROVIDERS.REDIS_QUEUE) private readonly queueRedis: Redis,
  ) {
    this.ticketManager = new DynamicConfigManager(
      this.ticketRedis,
      REDIS_KEYS.CONFIG_TICKET,
    );
    this.queueManager = new DynamicConfigManager(
      this.queueRedis,
      REDIS_KEYS.CONFIG_QUEUE,
    );
  }

  async onModuleInit(): Promise<void> {
    await this.seedTicketConfig();
    await this.syncAll();
  }

  async syncAll(): Promise<void> {
    await Promise.all([
      this.ticketManager.refresh(),
      this.queueManager.refresh(),
    ]);
  }

  isVirtualUserEnabled(): boolean {
    return this.queueManager.getBoolean('virtual.enabled', false);
  }

  getVirtualConfig(): {
    brpopTimeoutSeconds: number;
    maxSeatPickAttempts: number;
    errorDelayMs: number;
    processDelayMs: number;
  } {
    /* eslint-disable prettier/prettier */
    const brpopTimeoutSeconds = this.ticketManager.getNumber('virtual.brpop_timeout_sec', 2, { min: 1 });
    const maxSeatPickAttempts = this.ticketManager.getNumber('virtual.max_seat_attempts', 10, { min: 1 });
    const errorDelayMs = this.ticketManager.getNumber('virtual.error_delay_ms', 500, { min: 0 });
    const processDelayMs = this.ticketManager.getNumber('virtual.process_delay_ms', 1000, { min: 0 });
    /* eslint-enable prettier/prettier */

    return {
      brpopTimeoutSeconds,
      maxSeatPickAttempts,
      errorDelayMs,
      processDelayMs,
    };
  }

  private async seedTicketConfig(): Promise<void> {
    const env = process.env;
    const pipeline = this.ticketRedis.pipeline();

    this.applySeed(pipeline, REDIS_KEYS.CONFIG_TICKET, {
      'virtual.brpop_timeout_sec': [env.TICKET_VIRTUAL_BRPOP_TIMEOUT_SEC, '2'],
      'virtual.max_seat_attempts': [env.TICKET_VIRTUAL_MAX_SEAT_ATTEMPTS, '10'],
      'virtual.error_delay_ms': [env.TICKET_VIRTUAL_ERROR_DELAY_MS, '500'],
      'virtual.process_delay_ms': [env.TICKET_VIRTUAL_PROCESS_DELAY_MS, '1000'],
    });

    try {
      await pipeline.exec();
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('시드 실패: ticket config', err.stack);
    }
  }

  private applySeed(
    pipeline: ChainableCommander,
    key: string,
    config: Record<string, [string | undefined, string]>,
  ) {
    for (const [field, [envValue, defaultValue]] of Object.entries(config)) {
      if (envValue !== undefined && envValue !== '') {
        pipeline.hset(key, field, envValue);
      } else {
        pipeline.hsetnx(key, field, defaultValue);
      }
    }
  }
}
