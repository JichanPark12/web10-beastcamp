import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { TicketSetupService } from '../ticket-setup/ticket-setup.service';
import { RedisService } from '../redis/redis.service';
import {
  getNumberFromEnv,
  getTicketNumberField,
  seedTicketNumberField,
} from '../config/ticket-config.util';

@Injectable()
export class TicketSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicketSchedulerService.name);
  private isRunning = false;

  constructor(
    private readonly setupService: TicketSetupService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await seedTicketNumberField(
      this.redisService,
      'schedule.setup_interval_sec',
      getNumberFromEnv('SETUP_INTERVAL'),
      300,
    );
    await seedTicketNumberField(
      this.redisService,
      'schedule.open_delay_ms',
      getNumberFromEnv('TICKETING_OPEN_DELAY'),
      60000,
    );
    await seedTicketNumberField(
      this.redisService,
      'schedule.duration_ms',
      getNumberFromEnv('TICKETING_DURATION'),
      180000,
    );

    this.isRunning = true;
    void this.runLoop();
  }

  onModuleDestroy() {
    this.isRunning = false;
  }

  async handleCycle() {
    try {
      this.logger.log('Starting ticketing cycle...');

      await this.setupService.setup();

      const openDelay = await getTicketNumberField(
        this.redisService,
        'schedule.open_delay_ms',
        60000,
        { min: 0 },
      );
      const duration = await getTicketNumberField(
        this.redisService,
        'schedule.duration_ms',
        180000,
        { min: 0 },
      );

      await this.delay(openDelay);
      await this.setupService.openTicketing();

      await this.delay(duration);

      this.logger.log('Ticketing cycle completed successfully.');
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Ticketing cycle failed: ${err.message}`, err.stack);
    } finally {
      await this.setupService.tearDown();
    }
  }

  private async runLoop(): Promise<void> {
    while (this.isRunning) {
      try {
        const intervalSec = await getTicketNumberField(
          this.redisService,
          'schedule.setup_interval_sec',
          300,
          { min: 1 },
        );
        await this.delay(intervalSec * 1000);
        if (!this.isRunning) {
          break;
        }
        await this.handleCycle();
      } catch (e) {
        const err = e as Error;
        this.logger.error(`Scheduler loop failed: ${err.message}`, err.stack);
        await this.delay(1000);
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
