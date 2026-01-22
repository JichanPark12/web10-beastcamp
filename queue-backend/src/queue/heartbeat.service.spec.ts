import { PROVIDERS } from '@beastcamp/shared-constants';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { HeartbeatService } from './heartbeat.service';

describe('HeartbeatService', () => {
  let service: HeartbeatService;

  beforeEach(async () => {
    const redisMock = { zadd: jest.fn() };
    const configMock = { get: jest.fn().mockReturnValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HeartbeatService,
        { provide: ConfigService, useValue: configMock },
        { provide: PROVIDERS.REDIS_QUEUE, useValue: redisMock },
      ],
    }).compile();

    service = module.get<HeartbeatService>(HeartbeatService);
  });

  it('정의되어 있어야 한다', () => {
    expect(service).toBeDefined();
  });
});
