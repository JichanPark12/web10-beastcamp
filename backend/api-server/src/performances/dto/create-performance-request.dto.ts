import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePerformanceRequestDto {
  @ApiProperty({ description: '공연 이름', example: '임영웅 콘서트' })
  @IsString()
  @IsNotEmpty()
  performance_name: string;

  @ApiProperty({
    description: '티켓팅 시작 일시 (ISO 8601)',
    example: '2026-01-01T13:00:00Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  ticketing_date: string;

  @ApiProperty({
    description: '공연 일시 (ISO 8601)',
    example: '2026-01-05T19:00:00Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  performance_date: string;

  @ApiProperty({ description: '공연장 ID', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  venue_id: number;
}
