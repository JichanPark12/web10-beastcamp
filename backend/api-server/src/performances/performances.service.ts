import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Performance } from './entities/performance.entity';
import { CreatePerformanceRequestDto } from './dto/create-performance-request.dto';
import { Venue } from '../venues/entities/venue.entity';
import { SearchPerformancesRequestDto } from './dto/search-performances-request.dto';
import { SearchPerformancesResponseDto } from './dto/search-performances-response.dto';
import { PerformancesRepository } from './performances.repository';

@Injectable()
export class PerformancesService {
  constructor(
    private performancesRepository: PerformancesRepository,
    @InjectRepository(Venue)
    private venuesRepository: Repository<Venue>,
  ) {}

  async create(
    requestDto: CreatePerformanceRequestDto,
  ): Promise<{ id: number }> {
    // validate venue id
    const venue = await this.venuesRepository.findOne({
      where: { id: requestDto.venue_id },
    });
    if (!venue) {
      throw new BadRequestException('Invalid venue id');
    }

    const performance = new Performance(
      requestDto.performance_name,
      new Date(requestDto.ticketing_date),
      new Date(requestDto.performance_date),
      requestDto.venue_id,
    );
    const savedPerformance =
      await this.performancesRepository.save(performance);
    return { id: savedPerformance.id };
  }

  async search(
    requestDto: SearchPerformancesRequestDto,
  ): Promise<SearchPerformancesResponseDto> {
    const performances = await this.performancesRepository.search(requestDto);

    return SearchPerformancesResponseDto.fromEntities(performances);
  }
}
