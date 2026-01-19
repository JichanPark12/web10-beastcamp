import { Test, TestingModule } from '@nestjs/testing';
import { QueueTrigger } from './queue.trigger';
import { QueueWorker } from './queue.worker';
import { PROVIDERS } from '@beastcamp/shared-constants';

describe('QueueTrigger', () => {
  let trigger: QueueTrigger;
  let workerMock: Partial<QueueWorker>;
  let redisMock: Record<string, jest.Mock>;
  let subClientMock: Record<string, jest.Mock>;

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
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueTrigger,
        { provide: QueueWorker, useValue: workerMock },
        { provide: PROVIDERS.REDIS_QUEUE, useValue: redisMock },
      ],
    }).compile();

    trigger = module.get<QueueTrigger>(QueueTrigger);
  });

  it('handleCron 실행 시 worker의 이동 로직을 호출해야 한다', async () => {
    await trigger.handleCron();
    expect(workerMock.processQueueTransfer).toHaveBeenCalled();
  });

  it('onModuleInit 시 Redis 구독을 설정해야 한다', async () => {
    await trigger.onModuleInit();

    expect(subClientMock.subscribe).toHaveBeenCalledWith('channel:finish');
    expect(subClientMock.on).toHaveBeenCalledWith(
      'message',
      expect.any(Function),
    );
  });
});
