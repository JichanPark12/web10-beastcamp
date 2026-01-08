import { Venue } from '../entities/venue.entity';

export class VenueDto {
  id: number;
  venue_name: string;

  static fromEntity(venue: Venue): VenueDto {
    const dto = new VenueDto();
    dto.id = venue.id;
    dto.venue_name = venue.venueName;
    return dto;
  }
}

export class GetVenuesResponseDto {
  venues: VenueDto[];

  static fromEntities(venues: Venue[]): GetVenuesResponseDto {
    const dto = new GetVenuesResponseDto();
    dto.venues = venues.map((venue) => VenueDto.fromEntity(venue));
    return dto;
  }
}
