import { Test, TestingModule } from '@nestjs/testing';
import { QueueWorker } from './queue.worker';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { Logger } from '@nestjs/common';
import { QueueConfigService } from './queue-config.service';

describe('QueueWorker', () => {
  let worker: QueueWorker;
  let redisMock: Record<string, jest.Mock>;
  let configServiceMock: Record<string, unknown>;
  beforeEach(async () => {
    redisMock = {
      syncAndPromoteWaiters: jest.fn(),
    };
    configServiceMock = {
      sync: jest.fn().mockResolvedValue(undefined),
      worker: {
        maxCapacity: 10,
        heartbeatTimeoutMs: 60000,
        activeTTLMs: 300000,
      },
      heartbeat: {
        enabled: true,
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueWorker,
        {
          provide: QueueConfigService,
          useValue: configServiceMock,
        },
        {
          provide: PROVIDERS.REDIS_QUEUE,
          useValue: redisMock,
        },
      ],
    }).compile();

    worker = module.get<QueueWorker>(QueueWorker);
  });

  it('대기열 스케줄링 로직 호출 시 커스텀 루아 명령어가 올바른 인자로 실행되어야 한다', async () => {
    // 상황 설정: 루아 스크립트가 유저 2명을 이동시켰다고 가정
    const movedUsers = ['user1', 'user2'];
    redisMock.syncAndPromoteWaiters.mockResolvedValue(movedUsers);

    await worker.processQueueTransfer();

    // 검증: 루아 명령어가 한 번 호출되었는가?
    expect(redisMock.syncAndPromoteWaiters).toHaveBeenCalledTimes(1);

    // 검증: 인자가 순서대로 잘 들어갔는가?
    expect(redisMock.syncAndPromoteWaiters).toHaveBeenCalledWith(
      REDIS_KEYS.WAITING_QUEUE,
      REDIS_KEYS.ACTIVE_QUEUE,
      REDIS_KEYS.HEARTBEAT_QUEUE,
      REDIS_KEYS.VIRTUAL_ACTIVE_QUEUE,
      10, // maxCapacity
      expect.any(Number), // Date.now()
      60000, // heartbeatTimeoutMs
      300000, // activeTTLMs
      'queue:active:user:', // ACTIVE_USER prefix
      true, // heartbeatEnabled
    );
  });

  it('이동된 유저가 있으면 로그를 남겨야 한다', async () => {
    const movedUsers = ['user1'];
    redisMock.syncAndPromoteWaiters.mockResolvedValue(movedUsers);

    const loggerSpy = jest
      .spyOn(Logger.prototype, 'debug')
      .mockImplementation();

    await worker.processQueueTransfer();

    expect(loggerSpy).toHaveBeenCalledWith('🚀 유저 활성 큐 이동 완료', {
      count: 1,
      userIds: ['user1'],
    });
  });

  it('에러 발생 시 에러 로그를 남겨야 한다', async () => {
    redisMock.syncAndPromoteWaiters.mockRejectedValue(new Error('Redis Error'));
    const loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    await worker.processQueueTransfer();

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      '대기열 처리 중 오류가 발생했습니다.',
      expect.stringContaining('Redis Error'),
      { errorCode: 'QUEUE_TRANSFER_FAILED' },
    );
  });
});
