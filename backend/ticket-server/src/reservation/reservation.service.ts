import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { REDIS_CHANNELS } from '@beastcamp/shared-constants';
import { RedisService } from '../redis/redis.service';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { GetReservationsResponseDto } from './dto/get-reservations-response.dto';
import { CreateReservationResponseDto } from './dto/create-reservation-response.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);
  private readonly lockTtlMs = 5000;

  constructor(private readonly redisService: RedisService) {}

  async getSeats(
    sessionId: number,
    blockId: number,
  ): Promise<GetReservationsResponseDto> {
    await this.validateSessionBlock(sessionId, blockId);

    const { rowSize, colSize } = await this.getBlockInfo(blockId);
    const keys = this.generateSeatKeys(sessionId, blockId, rowSize, colSize);
    const values = await this.redisService.mget(keys);

    return { seats: this.mapToArray(values, rowSize, colSize) };
  }

  async reserve(
    dto: CreateReservationRequestDto,
    userId: string,
  ): Promise<CreateReservationResponseDto> {
    const { session_id: sessionId, seats } = dto;
    await this.acquireUserLock(userId);
    try {
      await this.validateTicketingOpen();

      const reservationMap = await this.prepareReservationMap(
        sessionId,
        seats,
        userId,
      );
      const rank = await this.executeAtomicReservation(
        reservationMap,
        sessionId,
        userId,
      );
      await this.publishReservationDoneEvent(userId);

      return { rank, seats };
    } finally {
      await this.releaseUserLock(userId);
    }
  }

  private async validateTicketingOpen() {
    const isOpen = await this.redisService.get('is_ticketing_open');
    if (isOpen !== 'true') throw new ForbiddenException('Ticketing not open');
  }

  private async acquireUserLock(userId: string): Promise<void> {
    const lockKey = `reservation:lock:user:${userId}`;
    const acquired = await this.redisService.setNxWithTtl(
      lockKey,
      '1',
      this.lockTtlMs,
    );
    if (!acquired) {
      throw new ConflictException('티켓팅 요청이 이미 진행 중입니다.');
    }
  }

  private async releaseUserLock(userId: string): Promise<void> {
    const lockKey = `reservation:lock:user:${userId}`;
    try {
      await this.redisService.del(lockKey);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('유저 락 해제 실패:', err.stack ?? err.message);
    }
  }

  private async publishReservationDoneEvent(userId: string): Promise<void> {
    try {
      await this.redisService.publishToQueue(
        REDIS_CHANNELS.QUEUE_EVENT_DONE,
        userId,
      );
      this.logger.log(`이벤트 발행 성공: ${userId}님이 티켓팅을 완료했습니다.`);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('이벤트 발행 중 오류 발생:', err.stack ?? err.message);
    }
  }

  private async prepareReservationMap(
    sessionId: number,
    seats: { block_id: number; row: number; col: number }[],
    userId: string,
  ): Promise<Record<string, string>> {
    const reservationMap: Record<string, string> = {};
    const blockInfoMap = new Map<
      number,
      { rowSize: number; colSize: number }
    >();

    for (const seat of seats) {
      const { block_id: blockId, row, col } = seat;

      await this.validateSessionBlock(sessionId, blockId);

      if (!blockInfoMap.has(blockId)) {
        const info = await this.getBlockInfo(blockId);
        blockInfoMap.set(blockId, info);
      }
      const { rowSize, colSize } = blockInfoMap.get(blockId)!;

      if (row < 0 || row >= rowSize || col < 0 || col >= colSize) {
        throw new BadRequestException(
          `Invalid coordinates for block ${blockId}`,
        );
      }
      const key = `reservation:session:${sessionId}:block:${blockId}:row:${row}:col:${col}`;

      if (reservationMap[key]) {
        throw new BadRequestException('Duplicate seats in request');
      }
      reservationMap[key] = userId;
    }
    return reservationMap;
  }

  private async executeAtomicReservation(
    reservationMap: Record<string, string>,
    sessionId: number,
    userId: string,
  ): Promise<number> {
    const success = await this.redisService.msetnx(reservationMap);

    if (!success)
      throw new BadRequestException('Some seats are already reserved');

    const rank = await this.redisService.incr(`rank:session:${sessionId}`);
    this.logger.log(
      `Reserved: ${userId} -> ${Object.keys(reservationMap).length} seats (Rank: ${rank})`,
    );
    return rank;
  }

  private async validateSessionBlock(sessionId: number, blockId: number) {
    const isValid = await this.redisService.sismember(
      `session:${sessionId}:blocks`,
      String(blockId),
    );
    if (!isValid)
      throw new BadRequestException(
        `Invalid block ${blockId} for session ${sessionId}`,
      );
  }

  private async getBlockInfo(blockId: number) {
    const data = await this.redisService.get(`block:${blockId}`);
    if (!data) throw new BadRequestException(`Block ${blockId} data not found`);
    return JSON.parse(data) as { rowSize: number; colSize: number };
  }

  private generateSeatKeys(
    sessionId: number,
    blockId: number,
    rowSize: number,
    colSize: number,
  ): string[] {
    const keys: string[] = [];
    for (let r = 0; r < rowSize; r++) {
      for (let c = 0; c < colSize; c++) {
        keys.push(
          `reservation:session:${sessionId}:block:${blockId}:row:${r}:col:${c}`,
        );
      }
    }
    return keys;
  }

  private mapToArray(
    values: (string | null)[],
    rowSize: number,
    colSize: number,
  ): boolean[][] {
    const array: boolean[][] = Array.from({ length: rowSize }, () =>
      Array<boolean>(colSize).fill(false),
    );
    let idx = 0;
    for (let r = 0; r < rowSize; r++) {
      for (let c = 0; c < colSize; c++) {
        if (values[idx++] !== null) array[r][c] = true;
      }
    }
    return array;
  }
}
