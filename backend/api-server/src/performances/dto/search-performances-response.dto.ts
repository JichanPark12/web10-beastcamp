import { Performance } from '../entities/performance.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PerformanceDto {
  @ApiProperty({ description: '공연 ID', example: 1 })
  performance_id: number;

  @ApiProperty({
    description: '공연 이름',
    example: 'wave to earth - 사랑으로 0.3',
  })
  performance_name: string;

  @ApiProperty({
    description: '티켓팅 시작 일시 (ISO 8601)',
    example: '2026-01-01T10:00:00Z',
  })
  ticketing_date: string;

  @ApiProperty({
    description: '티켓팅 플랫폼',
    example: 'interpark',
    enum: ['interpark', 'yes24', 'melon-ticket'],
  })
  platform: 'interpark' | 'yes24' | 'melon-ticket';

  static fromEntity(performance: Performance): PerformanceDto {
    const dto = new PerformanceDto();
    dto.performance_id = performance.id;
    dto.performance_name = performance.performanceName;
    dto.ticketing_date = performance.ticketingDate.toISOString();
    dto.platform = performance.platform;
    return dto;
  }
}

export class SearchPerformancesResponseDto {
  @ApiProperty({ type: [PerformanceDto], description: '검색된 공연 목록' })
  performances: PerformanceDto[];

  static fromEntities(
    performances: Performance[],
  ): SearchPerformancesResponseDto {
    const dto = new SearchPerformancesResponseDto();
    dto.performances = performances.map((performance) =>
      PerformanceDto.fromEntity(performance),
    );
    return dto;
  }
}
