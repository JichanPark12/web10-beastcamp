import { Module } from '@nestjs/common';
import { TicketSetupModule } from '../ticket-setup/ticket-setup.module';
import { TicketSchedulerService } from './ticket-scheduler.service';

@Module({
  imports: [TicketSetupModule],
  providers: [TicketSchedulerService],
  exports: [TicketSchedulerService],
})
export class TicketSchedulerModule {}
