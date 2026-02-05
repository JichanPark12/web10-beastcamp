import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PerformanceApiService } from './performance-api.service';
import { AxiosTraceInterceptor, TraceModule } from '@beastcamp/shared-nestjs';

@Module({
  imports: [HttpModule, TraceModule],
  providers: [PerformanceApiService, AxiosTraceInterceptor],
  exports: [PerformanceApiService],
})
export class PerformanceApiModule {}
