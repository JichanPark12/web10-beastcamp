import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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
  ): Promise<CreateReservationResponseDto> {
    const { session_id: sessionId, block_id: blockId, row, col } = dto;
    const userId = 'temp-user-id';

    await this.validateTicketingOpen();
    await this.validateSessionBlock(sessionId, blockId);
    await this.validateBlockSize(blockId, row, col);

    const key = `reservation:session:${sessionId}_block:${blockId}_row:${row}_col:${col}`;
    const success = await this.redisService.setNx(key, userId);

    if (!success) throw new BadRequestException('Seat already reserved');

    const rank = await this.redisService.incr(`rank:session:${sessionId}`);
    this.logger.log(`Reserved: ${userId} -> ${key} (Rank: ${rank})`);

    return { rank };
  }

  private async validateTicketingOpen() {
    const isOpen = await this.redisService.get('is_ticketing_open');
    if (isOpen !== 'true') throw new ForbiddenException('Ticketing not open');
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

  private async validateBlockSize(blockId: number, row: number, col: number) {
    const { rowSize, colSize } = await this.getBlockInfo(blockId);
    if (row < 0 || row >= rowSize || col < 0 || col >= colSize) {
      throw new BadRequestException('Invalid coordinates');
    }
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
          `reservation:session:${sessionId}_block:${blockId}_row:${r}_col:${c}`,
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
