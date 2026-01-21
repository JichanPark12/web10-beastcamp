import { Test, TestingModule } from '@nestjs/testing';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { QueueService } from './queue.service';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { HeartbeatService } from './heartbeat.service';

describe('QueueService', () => {
  let service: QueueService;
  const redisMock = {
    zrank: jest.fn(),
    zadd: jest.fn(),
    exists: jest.fn(),
    multi: jest.fn(),
  };
  const jwtServiceMock = {
    signAsync: jest.fn(),
  };
  const heartbeatServiceMock = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    redisMock.multi.mockImplementation(() => ({
      zadd: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    }));
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        {
          provide: PROVIDERS.REDIS_QUEUE,
          useValue: redisMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: HeartbeatService,
          useValue: heartbeatServiceMock,
        },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createEntry', () => {
    it('토큰이 이미 큐에 있으면 기존 항목을 반환한다', async () => {
      redisMock.zrank.mockResolvedValueOnce(3);

      const result = await service.createEntry('existing-123');

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

      const result = await service.createEntry();

      const expectedUserId = randomBuffer.toString('base64url');
      expect(redisMock.multi).toHaveBeenCalled();
      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        expectedUserId,
      );
      expect(result).toEqual({ userId: expectedUserId, position: 6 });
    });
  });

  describe('getStatus', () => {
    it('userId가 undefined이면 position null을 반환한다', async () => {
      const result = await service.getStatus(undefined);

      expect(redisMock.zrank).not.toHaveBeenCalled();
      expect(result).toEqual({ position: null });
    });

    it('활성 상태면 토큰과 position 0을 반환한다', async () => {
      redisMock.exists.mockResolvedValueOnce(1);
      jwtServiceMock.signAsync.mockResolvedValueOnce('token-123');

      const result = await service.getStatus('user-123');

      expect(redisMock.exists).toHaveBeenCalled();
      expect(jwtServiceMock.signAsync).toHaveBeenCalled();
      expect(result).toEqual({ token: 'token-123', position: 0 });
    });

    it('대기열에 존재하면 position을 반환한다', async () => {
      redisMock.exists.mockResolvedValueOnce(0);
      redisMock.zrank.mockResolvedValueOnce(4);

      const result = await service.getStatus('user-123');

      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'user-123',
      );
      expect(heartbeatServiceMock.update).toHaveBeenCalledWith('user-123');
      expect(result).toEqual({ position: 5 });
    });

    it('대기열에 없으면 position null을 반환한다', async () => {
      redisMock.exists.mockResolvedValueOnce(0);
      redisMock.zrank.mockResolvedValueOnce(null);

      const result = await service.getStatus('unknown-user');

      expect(redisMock.zrank).toHaveBeenCalledWith(
        REDIS_KEYS.WAITING_QUEUE,
        'unknown-user',
      );
      expect(result).toEqual({ position: null });
    });
  });
});
