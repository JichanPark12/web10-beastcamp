import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KopisService } from './kopis.service';
import { KopisScheduler } from './kopis.scheduler';
import { KopisController } from './kopis.controller';

@Module({
  imports: [HttpModule],
  controllers: [KopisController],
  providers: [KopisService, KopisScheduler],
  exports: [KopisService],
})
export class KopisModule {}
