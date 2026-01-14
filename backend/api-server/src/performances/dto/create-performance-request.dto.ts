import { IsISO8601, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePerformanceRequestDto {
  @ApiProperty({ description: '공연 이름', example: '임영웅 콘서트' })
  @IsString()
  @IsNotEmpty()
  performance_name: string;

  @ApiProperty({
    description: '티켓팅 시작 일시 (ISO 8601, UTC)',
    example: '2026-01-01T13:00:00Z',
  })
  @IsISO8601()
  @Matches(/Z$/, { message: 'Date must be in UTC format (ending with Z)' })
  @IsNotEmpty()
  ticketing_date: string;
}
