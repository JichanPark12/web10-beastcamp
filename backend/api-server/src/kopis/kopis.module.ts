import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KopisService } from './kopis.service';
import { KopisScheduler } from './kopis.scheduler';

@Module({
  imports: [HttpModule],
  providers: [KopisService, KopisScheduler],
  exports: [KopisService],
})
export class KopisModule {}
