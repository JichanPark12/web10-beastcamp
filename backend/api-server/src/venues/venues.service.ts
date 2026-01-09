import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Venue } from './entities/venue.entity';
import { CreateVenueRequestDto } from './dto/create-venue-request.dto';
import { GetVenuesResponseDto } from './dto/get-venue-response.dto';

@Injectable()
export class VenuesService {
  constructor(
    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,
  ) {}

  async create(requestDto: CreateVenueRequestDto): Promise<{ id: number }> {
    const venue = new Venue(requestDto.venue_name);
    const savedVenue = await this.venuesRepository.save(venue);
    return { id: savedVenue.id };
  }

  async findAll(): Promise<GetVenuesResponseDto> {
    const venues = await this.venuesRepository.find();
    return GetVenuesResponseDto.fromEntities(venues);
  }
}
