import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KopisService } from './kopis.service';
import { KopisScheduler } from './kopis.scheduler';
import { KopisController } from './kopis.controller';
import { TraceModule } from '@beastcamp/shared-nestjs';
import { AxiosTraceInterceptor } from '@beastcamp/shared-nestjs';

@Module({
  imports: [HttpModule, TraceModule],
  controllers: [KopisController],
  providers: [KopisService, KopisScheduler, AxiosTraceInterceptor],
  exports: [KopisService],
})
export class KopisModule {}
