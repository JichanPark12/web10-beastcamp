import { Injectable, Logger } from '@nestjs/common';
import { REDIS_CHANNELS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { TICKET_ERROR_CODES, TicketException } from '@beastcamp/shared-nestjs';
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
    await this.redisService.deleteAllExceptPrefix('config:');
    await this.redisService.deleteAllExceptPrefixQueue('config:');

    const performances = await this.performanceApi.getPerformances(1);
    if (performances.length === 0) {
      throw new TicketException(
        TICKET_ERROR_CODES.NO_PERFORMANCES_FOUND,
        '공연 정보가 존재하지 않습니다.',
        500,
      );
    }
    const performanceId = performances[0].performance_id;
    this.logger.log(`Setup 진행중. performanceId: ${performanceId}`);

    const sessions = await this.performanceApi.getSessions(performanceId);
    if (sessions.length === 0) {
      this.logger.error(
        `해당 공연에 해당하는 회차가 없습니다. performanceId: ${performanceId}`,
      );
      throw new TicketException(
        TICKET_ERROR_CODES.NO_SESSIONS_FOUND,
        '해당 공연에 해당하는 회차가 없습니다.',
        500,
      );
    }

    const sessionIds = sessions.map((session) => session.id.toString());
    await this.redisService.sadd(
      REDIS_KEYS.CURRENT_TICKETING_SESSIONS,
      ...sessionIds,
    );

    await this.redisService.publishToTicket(
      REDIS_CHANNELS.TICKETING_STATE_CHANGED,
      'setup',
    );

    const registTasks = sessions.map((session) => this.registToRedis(session));

    await Promise.all(registTasks);
    this.logger.log(`공연 Setup 완료. performance: ${performanceId}`);
  }

  async openTicketing(): Promise<void> {
    try {
      await this.redisService.set(REDIS_KEYS.TICKETING_OPEN, 'true');
      this.logger.log('is_ticketing_open : true');

      void this.redisService
        .publishToTicket(REDIS_CHANNELS.TICKETING_STATE_CHANGED, 'open')
        .catch((e) => {
          const err = e as Error;
          this.logger.error(`오픈 이벤트 발행 실패: ${err.message}`);
        });
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Failed to open ticketing: ${err.message}`);
      await this.redisService
        .set(REDIS_KEYS.TICKETING_OPEN, 'false')
        .catch((rollbackErr) => {
          this.logger.warn(
            `롤백 실패 - TICKETING_OPEN 상태 불일치 가능: ${(rollbackErr as Error).message}`,
          );
        });
    }
  }

  async tearDown(): Promise<void> {
    try {
      await this.redisService.set(REDIS_KEYS.TICKETING_OPEN, 'false');
      await this.redisService.del(REDIS_KEYS.CURRENT_TICKETING_SESSIONS);
      await this.redisService.deleteAllExceptPrefix('config:');
      await this.redisService.deleteAllExceptPrefixQueue('config:');
      this.logger.log('Ticketing closed (tear-down)');

      void this.redisService
        .publishToTicket(REDIS_CHANNELS.TICKETING_STATE_CHANGED, 'close')
        .catch((e) => {
          const err = e as Error;
          this.logger.error(`종료 이벤트 발행 실패: ${err.message}`);
        });
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Tear-down failed: ${err.message}`);
    }
  }

  private async registToRedis(session: SessionResponse): Promise<void> {
    const venue = await this.performanceApi.getVenueWithBlocks(session.venueId);
    if (venue.blocks.length === 0) {
      throw new TicketException(
        TICKET_ERROR_CODES.NO_BLOCKS_FOUND,
        '공연장의 블록 정보가 존재하지 않습니다.',
        500,
      );
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
