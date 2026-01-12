import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVenueRequestDto {
  @IsString()
  @IsNotEmpty()
  venue_name: string;
}
