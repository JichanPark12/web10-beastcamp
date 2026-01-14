import { Performance } from '../entities/performance.entity';
import { ApiProperty } from '@nestjs/swagger';

export class PerformanceDto {
  @ApiProperty({ description: '공연 ID', example: 1 })
  performance_id: number;

  @ApiProperty({ description: '공연 이름', example: '임영웅 콘서트' })
  performance_name: string;

  @ApiProperty({
    description: '티켓팅 시작 일시 (ISO 8601)',
    example: '2026-01-01T10:00:00Z',
  })
  ticketing_date: string;

  @ApiProperty({
    description: '공연 일시 (ISO 8601)',
    example: '2026-02-01T19:00:00Z',
  })
  performance_date: string;

  @ApiProperty({ description: '공연장 ID', example: 1 })
  venue_id: number;

  @ApiProperty({ description: '공연장 이름', example: '잠실 주경기장' })
  venue_name: string;

  static fromEntity(performance: Performance): PerformanceDto {
    const dto = new PerformanceDto();
    dto.performance_id = performance.id;
    dto.performance_name = performance.performanceName;
    dto.ticketing_date = performance.ticketingDate.toISOString();
    dto.performance_date = performance.performanceDate.toISOString();
    dto.venue_id = performance.venueId;
    dto.venue_name = performance.venue.venueName;
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
