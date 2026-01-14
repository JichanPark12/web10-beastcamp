import { IsISO8601, IsNumber, IsOptional, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchPerformancesRequestDto {
  @ApiPropertyOptional({
    description: '검색 기준 시간 (ISO 8601, UTC)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsISO8601()
  @Matches(/Z$/, { message: 'Date must be in UTC format (ending with Z)' })
  @IsOptional()
  ticketing_after?: string;

  @ApiPropertyOptional({
    description: '조회할 공연 개수',
    example: 10,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}
