import { Test, TestingModule } from '@nestjs/testing';
import { TraceService } from '@beastcamp/shared-nestjs';
import { QueueTrigger } from './queue.trigger';
import { QueueWorker } from './queue.worker';
import { PROVIDERS, REDIS_CHANNELS } from '@beastcamp/shared-constants';
import { QueueConfigService } from './queue-config.service';

describe('QueueTrigger', () => {
  let trigger: QueueTrigger;
  let workerMock: Partial<QueueWorker>;
  let redisMock: Record<string, jest.Mock>;
  let subClientMock: Record<string, jest.Mock>;
  let configServiceMock: {
    worker: { transferIntervalSec: number };
    sync: jest.Mock;
  };

  beforeEach(async () => {
    workerMock = {
      processQueueTransfer: jest.fn().mockResolvedValue(undefined),
    };

    subClientMock = {
      subscribe: jest.fn().mockResolvedValue(null),
      on: jest.fn(),
      quit: jest.fn(),
    };

    redisMock = {
      duplicate: jest.fn().mockReturnValue(subClientMock),
      hsetnx: jest.fn().mockResolvedValue(1),
      hget: jest.fn().mockResolvedValue(null),
    };
    configServiceMock = {
      worker: { transferIntervalSec: 60 },
      sync: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueTrigger,
        { provide: QueueWorker, useValue: workerMock },
        { provide: PROVIDERS.REDIS_QUEUE, useValue: redisMock },
        { provide: QueueConfigService, useValue: configServiceMock },
        {
          provide: TraceService,
          useValue: {
            generateTraceId: jest.fn().mockReturnValue('trace-id'),
            runWithTraceId: jest
              .fn()
              .mockImplementation((_id: string, fn: () => unknown) => fn()),
          },
        },
      ],
    }).compile();

    trigger = module.get<QueueTrigger>(QueueTrigger);
  });

  it('주기 실행 시 worker의 이동 로직을 호출해야 한다', async () => {
    jest.useFakeTimers();

    await trigger.onModuleInit();
    await jest.advanceTimersByTimeAsync(60000);
    await Promise.resolve();

    expect(workerMock.processQueueTransfer).toHaveBeenCalled();

    await trigger.onModuleDestroy();
    jest.useRealTimers();
  });

  it('onModuleInit 시 Redis 구독을 설정해야 한다', async () => {
    await trigger.onModuleInit();

    expect(subClientMock.subscribe).toHaveBeenCalledWith(
      REDIS_CHANNELS.QUEUE_EVENT_DONE,
    );
    expect(subClientMock.on).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });
});
