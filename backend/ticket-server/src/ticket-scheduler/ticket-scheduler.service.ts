import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { TicketSetupService } from '../ticket-setup/ticket-setup.service';

@Injectable()
export class TicketSchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TicketSchedulerService.name);
  private readonly duration: number;
  private readonly openDelay: number;
  private readonly interval: string;
  private job: CronJob | null = null;

  constructor(
    private readonly setupService: TicketSetupService,
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly config: ConfigService,
  ) {
    this.duration = parseInt(
      this.config.get('TICKETING_DURATION', '180000'),
      10,
    );
    this.openDelay = parseInt(
      this.config.get('TICKETING_OPEN_DELAY', '60000'),
      10,
    );
    this.interval = this.config.get('SETUP_INTERVAL', '0 4/5 * * * *');
  }

  onModuleInit() {
    this.job = new CronJob(this.interval, () => {
      void this.handleCycle();
    });

    // cron 패키지 버전 불일치로 인한 타입 오류를 방지하기 위해 any 캐스팅 사용
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.schedulerRegistry.addCronJob('setupJob', this.job as any);
    this.job.start();
    this.logger.log(`Scheduled setup job: ${this.interval}`);
  }

  onModuleDestroy() {
    if (this.job) {
      this.job.stop();
      this.logger.log('Stopped setup job');
    }
  }

  async handleCycle() {
    try {
      this.logger.log('Starting ticketing cycle...');

      await this.setupService.setup();

      await this.delay(this.openDelay);
      await this.setupService.openTicketing();

      await this.delay(this.duration);
      await this.setupService.tearDown();

      this.logger.log('Ticketing cycle completed successfully.');
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Ticketing cycle failed: ${err.message}`, err.stack);
      await this.setupService.tearDown();
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
