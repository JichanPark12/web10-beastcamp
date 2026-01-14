import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { PerformancesService } from './performances.service';
import { CreatePerformanceRequestDto } from './dto/create-performance-request.dto';
import { SearchPerformancesRequestDto } from './dto/search-performances-request.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchPerformancesResponseDto } from './dto/search-performances-response.dto';

@ApiTags('공연')
@Controller('api/performances')
export class PerformancesController {
  constructor(private readonly performancesService: PerformancesService) {}

  @Post()
  @ApiOperation({ summary: '공연 생성' })
  @ApiResponse({
    status: 201,
    description: '성공적으로 공연이 생성됨',
    schema: { example: { id: 1 } },
  })
  async create(
    @Body() createPerformanceRequestDto: CreatePerformanceRequestDto,
  ) {
    return this.performancesService.create(createPerformanceRequestDto);
  }

  @Get()
  @ApiOperation({ summary: '최신 공연 목록 조회' })
  @ApiResponse({
    status: 200,
    type: SearchPerformancesResponseDto,
    description: '성공적으로 목록을 조회함',
  })
  async search(
    @Query() searchPerformancesRequestDto: SearchPerformancesRequestDto,
  ) {
    return this.performancesService.search(searchPerformancesRequestDto);
  }
}
