import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { QueueWorker } from './queue.worker';
import { QueueTrigger } from './queue.trigger';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [QueueService, QueueWorker, QueueTrigger],
  controllers: [QueueController],
})
export class QueueModule {}
