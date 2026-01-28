import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { KopisService } from './kopis.service';

@Module({
  imports: [HttpModule],
  providers: [KopisService],
  exports: [KopisService],
})
export class KopisModule {}
