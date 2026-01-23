import { IsISO8601, IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePerformanceRequestDto {
  @ApiProperty({
    description: '공연 이름',
    example: 'wave to earth - 사랑으로 0.3',
  })
  @IsString()
  @IsNotEmpty()
  performance_name: string;

  @ApiProperty({
    description: '티켓팅 시작 일시 (ISO 8601, UTC)',
    example: '2026-01-01T13:00:00Z',
    pattern: '^.*Z$',
  })
  @IsISO8601()
  @Matches(/.*Z$/, { message: '날짜는 UTC 형식이어야 합니다 (Z로 끝나야 함)' })
  @IsNotEmpty()
  ticketing_date: string;
}
