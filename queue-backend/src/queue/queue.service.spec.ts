import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { QueueService } from './queue.service';
import crypto from 'crypto';

describe('QueueService', () => {
  let service: QueueService;
  const redisMock = {
    zrank: jest.fn(),
    zadd: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: PROVIDERS.REDIS_QUEUE,
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createQueueEntry', () => {
    it('토큰이 이미 큐에 있으면 기존 항목을 반환한다', async () => {
      redisMock.zrank.mockResolvedValueOnce(3);

      const result = await service.createQueueEntry('existing-123');

      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'existing-123',
      );
      expect(redisMock.zadd).not.toHaveBeenCalled();
      expect(result).toEqual({ userId: 'existing-123', position: 4 });
    });

    it('토큰이 없으면 신규 유저로 등록하고 위치를 반환한다', async () => {
      const randomBuffer = Buffer.from('fixed-secret-value');
      const randomBytesSpy = jest.spyOn(
        crypto,
        'randomBytes',
      ) as unknown as jest.SpyInstance<Buffer, [number]>;
      randomBytesSpy.mockImplementation(() => randomBuffer);
      redisMock.zrank.mockResolvedValueOnce(5);

      const result = await service.createQueueEntry();

      const expectedUserId = randomBuffer.toString('base64url');
      expect(redisMock.zadd).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'NX',
        expect.any(Number),
        expectedUserId,
      );
      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        expectedUserId,
      );
      expect(result).toEqual({ userId: expectedUserId, position: 6 });
    });
  });

  describe('getQueuePosition', () => {
    it('userId가 undefined이면 null을 반환한다', async () => {
      const result = await service.getQueuePosition(undefined);

      expect(redisMock.zrank).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('userId가 있고 대기열에 존재하면 position을 반환한다', async () => {
      redisMock.zrank.mockResolvedValueOnce(4);

      const result = await service.getQueuePosition('user-123');

      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'user-123',
      );
      expect(result).toBe(5);
    });

    it('userId가 있지만 대기열에 없으면 null을 반환한다', async () => {
      redisMock.zrank.mockResolvedValueOnce(null);

      const result = await service.getQueuePosition('unknown-user');

      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'unknown-user',
      );
      expect(result).toBeNull();
    });
  });
});
