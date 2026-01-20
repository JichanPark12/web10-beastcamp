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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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

  describe('onModuleInit', () => {
    it('CronJob을 레지스트리에 등록해야 한다', () => {
      service.onModuleInit();
      expect(jest.mocked(schedulerRegistry.addCronJob)).toHaveBeenCalledWith(
        'setupJob',
        expect.anything(),
      );
    });
  });

  describe('handleSetup', () => {
    it('성공 시 setup 호출 후 openTicketing을 예약해야 한다', async () => {
      jest.useFakeTimers();
      const openSpy = jest.spyOn(service, 'open').mockImplementation();

      await service.handleSetup();

      expect(jest.mocked(setupService.setup)).toHaveBeenCalled();

      // Fast-forward time
      jest.runAllTimers();
      expect(openSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });

    it('실패 시 tearDown을 호출해야 한다', async () => {
      jest
        .mocked(setupService.setup)
        .mockRejectedValue(new Error('Setup Error'));

      await service.handleSetup();

      expect(jest.mocked(setupService.tearDown)).toHaveBeenCalled();
    });
  });

  describe('open', () => {
    it('성공 시 openTicketing 호출 후 close를 예약해야 한다', async () => {
      jest.useFakeTimers();
      const closeSpy = jest.spyOn(service, 'close').mockImplementation();

      await service.open();

      expect(jest.mocked(setupService.openTicketing)).toHaveBeenCalled();

      jest.runAllTimers();
      expect(closeSpy).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe('close', () => {
    it('tearDown을 호출해야 한다', async () => {
      await service.close();
      expect(jest.mocked(setupService.tearDown)).toHaveBeenCalled();
    });
  });
});
