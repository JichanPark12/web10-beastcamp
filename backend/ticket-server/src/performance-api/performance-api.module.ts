import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PerformanceApiService } from './performance-api.service';

@Module({
  imports: [HttpModule],
  providers: [PerformanceApiService],
  exports: [PerformanceApiService],
})
export class PerformanceApiModule {}
