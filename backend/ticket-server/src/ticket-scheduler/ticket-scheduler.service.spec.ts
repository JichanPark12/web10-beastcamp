/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { TicketSchedulerService } from './ticket-scheduler.service';
import { TicketSetupService } from '../ticket-setup/ticket-setup.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

describe('TicketSchedulerService', () => {
  let service: TicketSchedulerService;
  let setupService: jest.Mocked<TicketSetupService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        TicketSchedulerService,
        {
          provide: TicketSetupService,
          useValue: {
            setup: jest.fn(),
            openTicketing: jest.fn(),
            tearDown: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockImplementation(
                (_key: string, defaultValue: unknown) => defaultValue,
              ),
          },
        },
      ],
    }).compile();

    service = module.get<TicketSchedulerService>(TicketSchedulerService);
    setupService = module.get(TicketSetupService);
    schedulerRegistry = module.get(SchedulerRegistry);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('onModuleInit', () => {
    it('CronJob을 레지스트리에 등록해야 한다', () => {
      service.onModuleInit();
      expect(jest.mocked(schedulerRegistry.addCronJob)).toHaveBeenCalledWith(
        'setupJob',
        expect.anything(),
      );
    });
  });

  describe('handleCycle', () => {
    it('전체 사이클(setup -> open -> close)이 순차적으로 실행되어야 한다', async () => {
      jest.useFakeTimers();

      const cyclePromise = service.handleCycle();

      expect(jest.mocked(setupService.setup)).toHaveBeenCalled();

      await Promise.resolve();

      await jest.advanceTimersByTimeAsync(60000);
      expect(jest.mocked(setupService.openTicketing)).toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(180000);
      expect(jest.mocked(setupService.tearDown)).toHaveBeenCalled();

      await cyclePromise;

      jest.useRealTimers();
    });

    it('중간에 에러 발생 시 tearDown을 호출해야 한다', async () => {
      jest.useFakeTimers();

      jest
        .mocked(setupService.setup)
        .mockRejectedValue(new Error('Setup Error'));

      const cyclePromise = service.handleCycle();

      await Promise.resolve();
      await Promise.resolve();

      expect(jest.mocked(setupService.tearDown)).toHaveBeenCalled();
      expect(jest.mocked(setupService.openTicketing)).not.toHaveBeenCalled();

      await cyclePromise;

      jest.useRealTimers();
    });
  });
});
