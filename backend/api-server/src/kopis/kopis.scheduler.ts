import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { KopisService } from './kopis.service';
import { DataSource } from 'typeorm';
import { Performance } from '../performances/entities/performance.entity';
import { Session } from '../performances/entities/session.entity';
import { Venue } from '../venues/entities/venue.entity';
import { Grade } from '../performances/entities/grade.entity';
import { BlockGrade } from '../performances/entities/block-grade.entity';
import { Block } from '../venues/entities/block.entity';
import { VENUES_DATA } from '../seeding/data/venues.data';
import { BLOCK_GRADE_RULES } from '../seeding/data/performances.data';

@Injectable()
export class KopisScheduler {
  private readonly logger = new Logger(KopisScheduler.name);

  constructor(
    private readonly kopisService: KopisService,
    private readonly dataSource: DataSource,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  @Cron('0 0 0 * * *', { name: 'kopis-sync', timeZone: 'Asia/Seoul' })
  async handleCron() {
    this.logger.log('Starting KOPIS data sync...');
    await this.syncPerformances();
    this.logger.log('KOPIS data sync completed.');
  }

  async syncPerformances() {
    const performanceRepository = this.dataSource.getRepository(Performance);
    const sessionRepository = this.dataSource.getRepository(Session);
    const venueRepository = this.dataSource.getRepository(Venue);
    const gradeRepository = this.dataSource.getRepository(Grade);
    const blockGradeRepository = this.dataSource.getRepository(BlockGrade);
    const blockRepository = this.dataSource.getRepository(Block);

    try {
      // Venue 목록 가져오기 (랜덤 할당용)
      let venues = await venueRepository.find();
      if (venues.length === 0) {
        this.logger.log('Initializing Venues and Blocks...');

        for (const venueData of VENUES_DATA) {
          // Venue 생성
          const venue = new Venue(venueData.name, venueData.url);
          const savedVenue = await venueRepository.save(venue);

          // Block 생성
          const blocks = venueData.blocks.map(
            (b) => new Block(savedVenue.id, b.name, b.rows, b.cols),
          );
          await blockRepository.save(blocks);
        }

        venues = await venueRepository.find();
      }
      const blocks = await blockRepository.find({ relations: ['venue'] });

      const performances = await this.kopisService.getPerformancesFromKopis();

      const detailPromises = performances.map(async (performance) => {
        const detail = await this.kopisService.getPerformanceDetailsFromKopis(
          performance.mt20id,
        );
        return detail;
      });
      const details = await Promise.all(detailPromises);
      const validDetails = details.filter((detail) => detail !== null);

      if (validDetails.length === 0) {
        this.logger.log('No valid performances found from KOPIS');
        return;
      }

      this.logger.log(`Found ${validDetails.length} valid performances`);

      // 00:05부터 익일 00:00까지 5분 단위로 TicketingDate 설정
      const now = new Date();
      const startTime = new Date(now);
      startTime.setHours(0, 5, 0, 0);

      const endTime = new Date(now);
      endTime.setHours(0, 0, 0, 0);
      endTime.setDate(endTime.getDate() + 1);

      const currentTime = new Date(startTime);
      let performanceCount = 0;
      let sessionCount = 0;
      let detailIndex = 0;
      const CHUNK_SIZE = 1000;
      const blockGradesBuffer: BlockGrade[] = [];

      // 00:05 ~ 익일 00:00 루프
      while (currentTime <= endTime) {
        // 순환: 공연 목록을 다 쓰면 처음부터 다시
        const detail = validDetails[detailIndex % validDetails.length];

        const performanceEntity = this.kopisService.toPerformanceEntity(detail);
        performanceEntity.ticketingDate = new Date(currentTime);
        performanceEntity.kopisId = `${detail.mt20id}_${performanceCount}`;

        try {
          const savedPerformance =
            await performanceRepository.save(performanceEntity);
          performanceCount++;

          // Session 생성
          const sessionDates = this.kopisService.parseSessionDates(detail);

          if (venues.length > 0) {
            const randomVenue =
              venues[Math.floor(Math.random() * venues.length)];

            for (const sessionDate of sessionDates) {
              const session = new Session(
                savedPerformance.id,
                sessionDate,
                randomVenue.id,
              );

              const savedSession = await sessionRepository.save(session);
              sessionCount++;

              // Mock Grade 생성
              const gradeConfigs = [
                { name: 'VIP', price: 150000 },
                { name: 'R', price: 120000 },
                { name: 'S', price: 90000 },
                { name: 'A', price: 60000 },
              ];

              const savedGrades: Grade[] = [];
              for (const config of gradeConfigs) {
                const grade = new Grade(
                  savedSession.id,
                  config.name,
                  config.price,
                );
                const savedGrade = await gradeRepository.save(grade);
                savedGrades.push(savedGrade);
              }

              // BlockGrade 매핑
              const blockMap = new Map<string, number>();
              blocks.forEach((b) => {
                blockMap.set(`${b.venue.venueName}:${b.blockDataName}`, b.id);
              });

              const venueRules = (
                BLOCK_GRADE_RULES as Record<string, Record<string, string[]>>
              )[randomVenue.venueName];

              if (!venueRules) {
                this.logger.warn(
                  `No rules found for venue: ${randomVenue.venueName}`,
                );
                continue;
              }

              const gradeNameMap = new Map<string, number>();
              savedGrades.forEach((g) => gradeNameMap.set(g.name, g.id));

              for (const [gradeName, blockNames] of Object.entries(
                venueRules,
              )) {
                const gradeId = gradeNameMap.get(gradeName);
                if (!gradeId) continue;

                for (const blockName of blockNames) {
                  const blockId = blockMap.get(
                    `${randomVenue.venueName}:${blockName}`,
                  );
                  if (!blockId) continue;

                  const blockGrade = new BlockGrade(
                    savedSession.id,
                    blockId,
                    gradeId,
                  );
                  blockGradesBuffer.push(blockGrade);
                }
              }
            }

            if (blockGradesBuffer.length >= CHUNK_SIZE) {
              await blockGradeRepository.save(blockGradesBuffer);
              blockGradesBuffer.length = 0;
              this.logger.log(`Flushed ${CHUNK_SIZE} block grades...`);
            }
          } else {
            this.logger.warn('⚠️ No venues available to assign sessions.');
          }
        } catch (e) {
          this.logger.error(
            `Error saving performance ${performanceEntity.kopisId}: ${e}`,
          );
        }

        // 5분 추가
        currentTime.setMinutes(currentTime.getMinutes() + 5);
        detailIndex++;
      }

      // 남은 버퍼 저장
      if (blockGradesBuffer.length > 0) {
        await blockGradeRepository.save(blockGradesBuffer);
        blockGradesBuffer.length = 0;
      }

      this.logger.log('\n=== Summary ===');
      this.logger.log(`Total Performances Scheduled: ${performanceCount}`);
      this.logger.log(`Total Sessions Scheduled: ${sessionCount}`);
    } catch (error) {
      this.logger.error('KOPIS data sync failed:', error);
    }
  }
}
