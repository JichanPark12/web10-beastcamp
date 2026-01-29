import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { TicketSetupModule } from '../ticket-setup/ticket-setup.module';
import { TicketSchedulerService } from './ticket-scheduler.service';

@Module({
  imports: [TicketSetupModule, ScheduleModule.forRoot(), ConfigModule],
  providers: [TicketSchedulerService],
  exports: [TicketSchedulerService],
})
export class TicketSchedulerModule {}
