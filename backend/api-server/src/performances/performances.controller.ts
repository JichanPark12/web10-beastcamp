import { Body, Controller, Post } from '@nestjs/common';
import { PerformancesService } from './performances.service';
import { CreatePerformanceRequestDto } from './dto/create-performance-request.dto';

@Controller('api/performances')
export class PerformancesController {
  constructor(private readonly performancesService: PerformancesService) {}

  @Post()
  async create(
    @Body() createPerformanceRequestDto: CreatePerformanceRequestDto,
  ) {
    return this.performancesService.create(createPerformanceRequestDto);
  }
}
