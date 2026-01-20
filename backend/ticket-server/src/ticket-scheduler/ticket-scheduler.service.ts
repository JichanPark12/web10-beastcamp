import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { CronJob } from 'cron';
import { TicketSetupService } from '../ticket-setup/ticket-setup.service';

@Injectable()
export class TicketSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(TicketSchedulerService.name);
  private readonly duration: number;
  private readonly openDelay: number;
  private readonly interval: string;

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
    const job = new CronJob(this.interval, () => {
      void this.handleSetup();
    });

    // cron 패키지 버전 불일치로 인한 타입 오류를 방지하기 위해 any 캐스팅 사용
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    this.schedulerRegistry.addCronJob('setupJob', job as any);
    job.start();
    this.logger.log(`Scheduled setup job: ${this.interval}`);
  }

  async handleSetup() {
    try {
      await this.setupService.setup();
      setTimeout(() => void this.open(), this.openDelay);
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Setup failed: ${err.message}`);
      await this.setupService.tearDown();
    }
  }

  async open() {
    try {
      await this.setupService.openTicketing();
      setTimeout(() => void this.close(), this.duration);
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Open failed: ${err.message}`);
      await this.setupService.tearDown();
    }
  }

  async close() {
    try {
      await this.setupService.tearDown();
    } catch (e) {
      const err = e as Error;
      this.logger.error(`Close failed: ${err.message}`);
    }
  }
}
