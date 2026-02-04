import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { REDIS_CHANNELS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { RedisService } from '../redis/redis.service';
import { CreateReservationRequestDto } from './dto/create-reservation-request.dto';
import { GetReservationsResponseDto } from './dto/get-reservations-response.dto';
import { CreateReservationResponseDto } from './dto/create-reservation-response.dto';

@Injectable()
export class ReservationService {
  private readonly logger = new Logger(ReservationService.name);

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
    await this.validateTicketingOpen();

    const seatKeys = await this.prepareReservationKeys(sessionId, seats);
    const rank = await this.executeAtomicReservation(
      seatKeys,
      sessionId,
      userId,
    );
    await this.publishReservationDoneEvent(userId);

    return { rank, seats };
  }

  private async validateTicketingOpen() {
    const isOpen = await this.redisService.get(REDIS_KEYS.TICKETING_OPEN);
    if (isOpen !== 'true') throw new ForbiddenException('Ticketing not open');
  }

  private async publishReservationDoneEvent(userId: string): Promise<void> {
    try {
      await this.redisService.publishToQueue(
        REDIS_CHANNELS.QUEUE_EVENT_DONE,
        userId,
      );
      this.logger.log(
        `티켓팅 완료 이벤트(active token 만료): ${userId}님이 티켓팅을 완료했습니다.`,
      );
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error('이벤트 발행 중 오류 발생:', err.stack ?? err.message);
    }
  }

  private async prepareReservationKeys(
    sessionId: number,
    seats: { block_id: number; row: number; col: number }[],
  ): Promise<string[]> {
    const seatKeys: string[] = [];
    const blockInfoMap = new Map<
      number,
      { rowSize: number; colSize: number }
    >();

    const uniqueKeys = new Set<string>();

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

      if (uniqueKeys.has(key)) {
        throw new BadRequestException('Duplicate seats in request');
      }
      uniqueKeys.add(key);
      seatKeys.push(key);
    }
    return seatKeys;
  }

  private async executeAtomicReservation(
    seatKeys: string[],
    sessionId: number,
    userId: string,
  ): Promise<number> {
    const rankKey = `rank:session:${sessionId}`;
    const [success, rank] = await this.redisService.atomicReservation(
      seatKeys,
      userId,
      rankKey,
    );

    if (success !== 1)
      throw new BadRequestException('Some seats are already reserved');

    this.logger.log(
      `예매 완료: userId:${userId} -> ${seatKeys.length}개의 seats. sessionId:${sessionId}, rank:${rank}`,
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
