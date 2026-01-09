import { IsISO8601, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePerformanceRequestDto {
  @IsString()
  @IsNotEmpty()
  performance_name: string;

  @IsISO8601()
  @IsNotEmpty()
  ticketing_date: string;

  @IsISO8601()
  @IsNotEmpty()
  performance_date: string;

  @IsNumber()
  @IsNotEmpty()
  venue_id: number;
}
