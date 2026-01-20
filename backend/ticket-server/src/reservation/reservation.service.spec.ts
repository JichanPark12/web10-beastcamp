import { Test, TestingModule } from '@nestjs/testing';
import { ReservationService } from './reservation.service';
import { RedisService } from '../redis/redis.service';

describe('ReservationService', () => {
  let service: ReservationService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockRedisService = {
      set: jest.fn(),
      get: jest.fn(),
      setNx: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationService,
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<ReservationService>(ReservationService);
    redisService = module.get(RedisService);
  });

  it('정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });
});
