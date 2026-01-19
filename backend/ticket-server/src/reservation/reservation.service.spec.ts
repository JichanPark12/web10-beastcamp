import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { PerformanceApiService } from '../performance-api/performance-api.service';
import { RedisService } from '../redis/redis.service';

describe('ReservationService', () => {
  let service: ReservationService;

  const mockPerformanceApi = {
    getPerformances: jest.fn(),
    getSessions: jest.fn(),
    getVenueWithBlocks: jest.fn(),
  };

  const mockRedisService = {
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        { provide: PerformanceApiService, useValue: mockPerformanceApi },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('setup 호출 시', () => {
    const performanceId = 1;
    const mockPerformances = [
      {
        performance_id: 1,
        performance_name: 'Test',
        ticketing_date: '2026-01-01',
      },
    ];
    const mockSessions = [
      {
        id: 1,
        performanceId: 1,
        venueId: 1,
        sessionDate: '2026-01-20T10:00:00Z',
      },
      {
        id: 2,
        performanceId: 1,
        venueId: 1,
        sessionDate: '2026-01-20T14:00:00Z',
      },
      {
        id: 3,
        performanceId: 1,
        venueId: 2,
        sessionDate: '2026-01-21T10:00:00Z',
      },
    ];
    const mockVenue1 = {
      id: 1,
      venueName: 'V1',
      blocks: [{ id: 1, rowSize: 10, colSize: 10 }],
    };
    const mockVenue2 = {
      id: 2,
      venueName: 'V2',
      blocks: [{ id: 2, rowSize: 20, colSize: 20 }],
    };

    describe('유효한 공연 정보가 존재하면', () => {
      beforeEach(() => {
        mockPerformanceApi.getPerformances.mockResolvedValue(mockPerformances);
        mockPerformanceApi.getSessions.mockResolvedValue(mockSessions);
        mockPerformanceApi.getVenueWithBlocks.mockImplementation(
          (id: number) =>
            id === 1
              ? Promise.resolve(mockVenue1)
              : Promise.resolve(mockVenue2),
        );
        mockRedisService.set.mockResolvedValue('OK');
      });

      it('최신 공연을 조회해야 한다', async () => {
        await service.setup();
        expect(mockPerformanceApi.getPerformances).toHaveBeenCalledWith(1);
      });

      it('회차 목록을 조회해야 한다', async () => {
        await service.setup();
        expect(mockPerformanceApi.getSessions).toHaveBeenCalledWith(
          performanceId,
        );
      });

      it('중복된 공연장을 제외하고 정보를 조회해야 한다', async () => {
        await service.setup();
        expect(mockPerformanceApi.getVenueWithBlocks).toHaveBeenCalledTimes(2);
      });

      it('구역 정보를 Redis에 저장해야 한다', async () => {
        await service.setup();

        expect(mockRedisService.set).toHaveBeenCalledWith(
          'venue:1_block:1',
          JSON.stringify({ rowSize: 10, colSize: 10 }),
        );
        expect(mockRedisService.set).toHaveBeenCalledWith(
          'venue:2_block:2',
          JSON.stringify({ rowSize: 20, colSize: 20 }),
        );
      });
    });

    describe('공연 정보가 없으면', () => {
      it('에러를 던져야 한다', async () => {
        mockPerformanceApi.getPerformances.mockResolvedValue([]);
        await expect(service.setup()).rejects.toThrow('No performances found');
      });
    });

    describe('API 호출이 실패하면', () => {
      it('에러를 전파해야 한다', async () => {
        mockPerformanceApi.getPerformances.mockRejectedValue(
          new Error('API Error'),
        );
        await expect(service.setup()).rejects.toThrow('API Error');
      });
    });
  });
});
