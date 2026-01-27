import { Injectable, Logger } from '@nestjs/common';
import { REDIS_KEYS } from '@beastcamp/shared-constants';
import {
  PerformanceApiService,
  SessionResponse,
} from '../performance-api/performance-api.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class TicketSetupService {
  private readonly logger = new Logger(TicketSetupService.name);

  constructor(
    private readonly performanceApi: PerformanceApiService,
    private readonly redisService: RedisService,
  ) {}

  async setup(): Promise<void> {
    await this.redisService.flushAll();

    const performances = await this.performanceApi.getPerformances(1);
    if (performances.length === 0) {
      throw new Error('No performances found');
    }
    const performanceId = performances[0].performance_id;
    this.logger.log(`Starting setup for performance: ${performanceId}`);

    const sessions = await this.performanceApi.getSessions(performanceId);
    if (sessions.length === 0) {
      throw new Error('No sessions found');
    }

    await this.redisService.set(
      REDIS_KEYS.CURRENT_TICKETING_SESSION,
      sessions[0].id.toString(),
    );

    const registTasks = sessions.map((session) => this.registToRedis(session));

    await Promise.all(registTasks);
    this.logger.log(`Setup completed for performance: ${performanceId}`);
  }

  async openTicketing(): Promise<void> {
    try {
      await this.redisService.set('is_ticketing_open', 'true');
      this.logger.log('Ticketing opened');
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Failed to open ticketing: ${err.message}`);
      await this.redisService.set('is_ticketing_open', 'false');
    }
  }

  async tearDown(): Promise<void> {
    try {
      await this.redisService.set('is_ticketing_open', 'false');
      await this.redisService.del(REDIS_KEYS.CURRENT_TICKETING_SESSION);
      this.logger.log('Ticketing closed (tear-down)');
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Tear-down failed: ${err.message}`);
    }
  }

  private async registToRedis(session: SessionResponse): Promise<void> {
    const venue = await this.performanceApi.getVenueWithBlocks(session.venueId);
    if (venue.blocks.length === 0) {
      throw new Error(`No blocks found for venue: ${session.venueId}`);
    }

    const blockIds = venue.blocks.map((b) => b.id);
    await this.redisService.sadd(
      `session:${session.id}:blocks`,
      ...blockIds.map(String),
    );

    const blockTasks = venue.blocks.map((block) => {
      const data = JSON.stringify({
        rowSize: block.rowSize,
        colSize: block.colSize,
      });
      return this.redisService.set(`block:${block.id}`, data);
    });

    await Promise.all(blockTasks);
  }
}
