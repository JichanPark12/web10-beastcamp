/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { RedisService } from '../redis/redis.service';

describe('ReservationService', () => {
  let service: ReservationService;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            mget: jest.fn(),
            sismember: jest.fn(),
            setNx: jest.fn(),
            setNxWithTtl: jest.fn(),
            incr: jest.fn(),
            publishToQueue: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    redisService = module.get(RedisService);
  });

  describe('getSeats', () => {
    const sessionId = 1;
    const blockId = 10;

    it('유효하지 않은 블록이면 BadRequestException을 던져야 한다', async () => {
      redisService.sismember.mockResolvedValue(false);

      await expect(service.getSeats(sessionId, blockId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('블록 정보가 없으면 BadRequestException을 던져야 한다', async () => {
      redisService.sismember.mockResolvedValue(true);
      redisService.get.mockResolvedValue(null);

      await expect(service.getSeats(sessionId, blockId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('정상적인 경우 2차원 배열의 좌석 현황을 반환해야 한다', async () => {
      const mockBlockData = JSON.stringify({ rowSize: 2, colSize: 2 });
      redisService.sismember.mockResolvedValue(true);
      redisService.get.mockResolvedValue(mockBlockData);
      redisService.mget.mockResolvedValue(['user1', null, null, 'user2']);

      const result = await service.getSeats(sessionId, blockId);

      expect(result.seats).toEqual([
        [true, false],
        [false, true],
      ]);
    });
  });

  describe('reserve', () => {
    const dto = { session_id: 1, block_id: 10, row: 0, col: 0 };
    const userId = 'user-1';

    it('티켓팅이 오픈되지 않았으면 ForbiddenException을 던져야 한다', async () => {
      redisService.setNxWithTtl.mockResolvedValue(true);
      redisService.get.mockResolvedValue('false');

      await expect(service.reserve(dto, userId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('유효하지 않은 블록이면 BadRequestException을 던져야 한다', async () => {
      redisService.setNxWithTtl.mockResolvedValue(true);
      redisService.get.mockResolvedValue('true'); // ticketing open
      redisService.sismember.mockResolvedValue(false);

      await expect(service.reserve(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('좌석 좌표가 범위를 벗어나면 BadRequestException을 던져야 한다', async () => {
      const mockBlockData = JSON.stringify({ rowSize: 2, colSize: 2 });
      redisService.setNxWithTtl.mockResolvedValue(true);
      redisService.get.mockImplementation((key) => {
        if (key === 'is_ticketing_open') return Promise.resolve('true');
        if (key === 'block:10') return Promise.resolve(mockBlockData);
        return Promise.resolve(null);
      });
      redisService.sismember.mockResolvedValue(true);

      const invalidDto = { ...dto, row: 5 };
      await expect(service.reserve(invalidDto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('이미 예약된 좌석이면 BadRequestException을 던져야 한다', async () => {
      const mockBlockData = JSON.stringify({ rowSize: 2, colSize: 2 });
      redisService.setNxWithTtl.mockResolvedValue(true);
      redisService.get.mockImplementation((key) => {
        if (key === 'is_ticketing_open') return Promise.resolve('true');
        if (key === 'block:10') return Promise.resolve(mockBlockData);
        return Promise.resolve(null);
      });
      redisService.sismember.mockResolvedValue(true);
      redisService.setNx.mockResolvedValue(false);

      await expect(service.reserve(dto, userId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('정상적인 경우 예약을 성공하고 순번을 반환해야 한다', async () => {
      const mockBlockData = JSON.stringify({ rowSize: 2, colSize: 2 });
      redisService.setNxWithTtl.mockResolvedValue(true);
      redisService.get.mockImplementation((key) => {
        if (key === 'is_ticketing_open') return Promise.resolve('true');
        if (key === 'block:10') return Promise.resolve(mockBlockData);
        return Promise.resolve(null);
      });
      redisService.sismember.mockResolvedValue(true);
      redisService.setNx.mockResolvedValue(true);
      redisService.incr.mockResolvedValue(5); // Rank 5 발급
      redisService.publishToQueue.mockResolvedValue(undefined);

      const result = await service.reserve(dto, userId);

      expect(result.rank).toBe(5);
      expect(redisService.setNx).toHaveBeenCalled();
      expect(redisService.incr).toHaveBeenCalledWith('rank:session:1');
    });
  });
});
