import { Test, TestingModule } from '@nestjs/testing';
import { QueueWorker } from './queue.worker';
import { PROVIDERS, REDIS_KEYS } from '@beastcamp/shared-constants';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('QueueWorker', () => {
  let worker: QueueWorker;
  let redisMock: Record<string, jest.Mock>;

  beforeEach(async () => {
    redisMock = {
      transferUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueWorker,
        {
          provide: PROVIDERS.REDIS_QUEUE,
          useValue: redisMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(10),
          },
        },
      ],
    }).compile();

    worker = module.get<QueueWorker>(QueueWorker);
  });

  it('대기열 스케줄링 로직 호출 시 커스텀 루아 명령어가 올바른 인자로 실행되어야 한다', async () => {
    // 상황 설정: 루아 스크립트가 유저 2명을 이동시켰다고 가정
    const movedUsers = ['user1', 'user2'];
    redisMock.transferUser.mockResolvedValue(movedUsers);

    await worker.processQueueTransfer();

    // 검증: 루아 명령어가 한 번 호출되었는가?
    expect(redisMock.transferUser).toHaveBeenCalledTimes(1);

    // 검증: 인자가 순서대로 잘 들어갔는가? (KEYS[1], KEYS[2], ARGV[1], ARGV[2])
    // 1: 대기큐, 2: 활성큐, 3: MAX_CAPACITY, 4: 타임스탬프(문자열)
    expect(redisMock.transferUser).toHaveBeenCalledWith(
      REDIS_KEYS.WAITING_QUEUE,
      REDIS_KEYS.ACTIVE_QUEUE,
      10, // MAX_CAPACITY
      expect.any(String), // Date.now().toString()
    );
  });

  it('이동된 유저가 있으면 로그를 남겨야 한다', async () => {
    const movedUsers = ['user1'];
    redisMock.transferUser.mockResolvedValue(movedUsers);

    // Logger spy 생성 (선택 사항)
    const loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();

    await worker.processQueueTransfer();

    expect(loggerSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        '🚀 [입장] 유저 user1님이 활성 큐로 이동했습니다.',
      ),
    );
  });

  it('에러 발생 시 에러 로그를 남겨야 한다', async () => {
    // 상황 설정: Redis 실행 중 에러 발생
    redisMock.transferUser.mockRejectedValue(new Error('Redis Error'));
    const loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    await worker.processQueueTransfer();

    expect(loggerErrorSpy).toHaveBeenCalledWith(
      '대기열 스케줄링 중 오류 발생:',
      expect.any(Error),
    );
  });
});
