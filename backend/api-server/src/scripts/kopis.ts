import { VENUES_DATA } from '../seeding/data/venues.data';
import { Grade } from '../performances/entities/grade.entity';
import { BlockGrade } from '../performances/entities/block-grade.entity';
import { Block } from '../venues/entities/block.entity';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { KopisService } from '../kopis/kopis.service';
import { DataSource } from 'typeorm';
import { Performance } from '../performances/entities/performance.entity';
import { Session } from '../performances/entities/session.entity';
import { Venue } from '../venues/entities/venue.entity';
import { BLOCK_GRADE_RULES } from 'src/seeding/data/performances.data';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const kopisService = app.get(KopisService);
  const dataSource = app.get(DataSource);

  // Repository 가져오기
  const performanceRepository = dataSource.getRepository(Performance);
  const sessionRepository = dataSource.getRepository(Session);
  const venueRepository = dataSource.getRepository(Venue);
  const gradeRepository = dataSource.getRepository(Grade);
  const blockGradeRepository = dataSource.getRepository(BlockGrade);
  const blockRepository = dataSource.getRepository(Block);

  try {
    console.log('Fetching KOPIS data...');

    // Venue 목록 가져오기 (랜덤 할당용)
    let venues = await venueRepository.find();
    if (venues.length === 0) {
      console.log('Initializing Venues and Blocks...');

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

      // 다시 조회 (Block 포함)
      venues = await venueRepository.find();
    }
    const blocks = await blockRepository.find({ relations: ['venue'] });

    const performances = await kopisService.getPerformancesFromKopis();

    // 먼저 모든 상세 정보를 비동기로 가져옴
    const detailPromises = performances.map(async (performance) => {
      const detail = await kopisService.getPerformanceDetailsFromKopis(
        performance.mt20id,
      );
      return detail;
    });
    const details = await Promise.all(detailPromises);
    const validDetails = details.filter((detail) => detail !== null);

    if (validDetails.length === 0) {
      console.log('No valid performances found from KOPIS');
      return;
    }

    console.log(`Found ${validDetails.length} valid performances`);

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

      const performanceEntity = kopisService.toPerformanceEntity(detail);
      performanceEntity.ticketingDate = new Date(currentTime);
      performanceEntity.kopisId = `${detail.mt20id}_${performanceCount}`;

      // DB 저장
      const savedPerformance =
        await performanceRepository.save(performanceEntity);

      performanceCount++;

      // Session 생성
      const sessionDates = kopisService.parseSessionDates(detail);

      if (venues.length > 0) {
        const randomVenue = venues[Math.floor(Math.random() * venues.length)];

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
            const grade = new Grade(savedSession.id, config.name, config.price);
            const savedGrade = await gradeRepository.save(grade);
            savedGrades.push(savedGrade);
          }

          // BlockGrade 매핑 (Venue의 모든 Block에 대해)

          const venueMap = new Map<string, number>();
          venues.forEach((v) => venueMap.set(v.venueName, v.id));

          const blockMap = new Map<string, number>(); // Key: "VenueName:BlockName" -> Value: BlockId
          blocks.forEach((b) => {
            blockMap.set(`${b.venue.venueName}:${b.blockDataName}`, b.id);
          });
          // 4. BlockGrade 생성 (규칙 기반)
          const venueRules = (
            BLOCK_GRADE_RULES as Record<string, Record<string, string[]>>
          )[randomVenue.venueName];
          if (!venueRules) {
            console.warn(`No rules found for venue: ${randomVenue.venueName}`);
            continue;
          }

          // 구역별 등급 매핑
          const gradeNameMap = new Map<string, number>();
          savedGrades.forEach((g) => gradeNameMap.set(g.name, g.id));

          for (const [gradeName, blockNames] of Object.entries(venueRules)) {
            const gradeId = gradeNameMap.get(gradeName);
            if (!gradeId) continue;

            for (const blockName of blockNames) {
              const blockId = blockMap.get(
                `${randomVenue.venueName}:${blockName}`,
              );
              if (!blockId) {
                continue;
              }
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
          console.log(`Flushed ${CHUNK_SIZE} block grades...`);
        }
      } else {
        console.warn('⚠️ No venues available to assign sessions.');
      }
      // 5분 추가
      currentTime.setMinutes(currentTime.getMinutes() + 5);
      detailIndex++;
    }

    console.log('\n=== Summary ===');
    console.log(`Total Performances Scheduled: ${performanceCount}`);
    console.log(`Total Sessions Scheduled: ${sessionCount}`);
  } catch (error) {
    console.error('KOPIS data sync failed:');
    console.error(error);
    if (error instanceof Error) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await app.close();
  }
}

void bootstrap();
