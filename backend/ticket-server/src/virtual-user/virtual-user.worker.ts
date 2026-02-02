import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { ReservationService } from '../reservation/reservation.service';
import { REDIS_CHANNELS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { TicketConfigService } from '../config/ticket-config.service';

@Injectable()
export class VirtualUserWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VirtualUserWorker.name);
  private isRunning = false;

  constructor(
    private readonly redisService: RedisService,
    private readonly reservationService: ReservationService,
    private readonly configService: TicketConfigService,
  ) {}

  onModuleInit() {
    this.isRunning = true;
    void this.consumeLoop();
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  private async consumeLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.configService.syncAll();

        const isEnabled = this.configService.isVirtualUserEnabled();
        if (!isEnabled) {
          const { errorDelayMs } = this.configService.getVirtualConfig();
          await this.delay(errorDelayMs);
          continue;
        }

        const config = this.configService.getVirtualConfig();

        const result = await this.redisService.brpopQueueList(
          REDIS_KEYS.VIRTUAL_ACTIVE_QUEUE,
          config.brpopTimeoutSeconds,
        );

        if (!this.isRunning) {
          return;
        }

        if (!result) {
          continue;
        }

        const [, userId] = result;

        await this.processVirtualUser(userId, config.maxSeatPickAttempts);

        if (config.processDelayMs > 0) {
          await this.delay(config.processDelayMs);
        }
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        this.logger.error(
          `가상 유저 처리 루프 오류: ${err.message}`,
          err.stack,
        );
        const { errorDelayMs } = this.configService.getVirtualConfig();
        await this.delay(errorDelayMs);
      }
    }
  }

  private async processVirtualUser(
    userId: string,
    maxSeatPickAttempts: number,
  ): Promise<void> {
    const sessionId = await this.redisService.srandmember(
      REDIS_KEYS.CURRENT_TICKETING_SESSIONS,
    );
    if (!sessionId) {
      this.logger.warn(
        '가상 유저 처리 실패: 현재 티켓팅 회차가 설정되지 않았습니다.',
      );
      await this.releaseActiveUser(userId, 'no_session');
      return;
    }

    const blockId = await this.redisService.srandmember(
      `session:${sessionId}:blocks`,
    );
    if (!blockId) {
      this.logger.warn(
        `가상 유저 처리 실패: 회차 ${sessionId}에 블록이 없습니다.`,
      );
      await this.releaseActiveUser(userId, 'no_block');
      return;
    }

    const blockData = await this.redisService.get(`block:${blockId}`);
    if (!blockData) {
      this.logger.warn(`가상 유저 처리 실패: 블록 ${blockId} 정보가 없습니다.`);
      await this.releaseActiveUser(userId, 'no_block_data');
      return;
    }

    const { rowSize, colSize } = JSON.parse(blockData) as {
      rowSize: number;
      colSize: number;
    };

    for (let attempt = 0; attempt < maxSeatPickAttempts; attempt++) {
      const row = Math.floor(Math.random() * rowSize);
      const col = Math.floor(Math.random() * colSize);

      try {
        await this.reservationService.reserve(
          {
            session_id: Number(sessionId),
            seats: [{ block_id: Number(blockId), row, col }],
          },
          userId,
        );
        this.logger.log(
          `가상 유저 예약 완료: user=${userId}, session=${sessionId}, block=${blockId}, row=${row}, col=${col}`,
        );
        return;
      } catch (error: unknown) {
        if (error instanceof ForbiddenException) {
          this.logger.debug('티켓팅이 열려있지 않아 가상 예약을 건너뜁니다.');
          await this.releaseActiveUser(userId, 'ticketing_closed');
          return;
        }

        if (error instanceof BadRequestException) {
          continue;
        }

        const err = error instanceof Error ? error : new Error('Unknown error');
        this.logger.error(`가상 유저 예약 실패: ${err.message}`, err.stack);
        await this.releaseActiveUser(userId, 'unexpected_error');
        return;
      }
    }

    this.logger.warn(
      `가상 유저 예약 실패: user=${userId}, seat 선택 재시도 한도 초과`,
    );
    await this.releaseActiveUser(userId, 'max_attempts');
  }

  private async releaseActiveUser(
    userId: string,
    reason: string,
  ): Promise<void> {
    try {
      await this.redisService.publishToQueue(
        REDIS_CHANNELS.QUEUE_EVENT_DONE,
        userId,
      );
      this.logger.debug(
        `가상 유저 활성 해제 요청: user=${userId}, reason=${reason}`,
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(`가상 유저 활성 해제 실패: ${err.message}`, err.stack);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
