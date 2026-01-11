import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('공연 (Performances) API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/performances 요청 시', () => {
    let venueId: number;

    beforeAll(async () => {
      // 공연 생성을 위해 미리 공연장(Venue)을 하나 생성합니다.
      const venueResponse = await request(app.getHttpServer() as App)
        .post('/api/venues')
        .send({ venue_name: '테스트 공연장' });

      const body = venueResponse.body as { id: number };
      venueId = body.id;
    });

    describe('유효한 공연 정보가 주어지면', () => {
      let response: request.Response;

      beforeAll(async () => {
        const validBody = {
          performance_name: '테스트 공연',
          ticketing_date: new Date().toISOString(),
          performance_date: new Date().toISOString(),
          venue_id: venueId,
        };

        response = await request(app.getHttpServer() as App)
          .post('/api/performances')
          .send(validBody);
      });

      it('HTTP 상태 코드 201을 반환해야 한다', () => {
        expect(response.status).toBe(201);
      });

      it('응답 본문에 생성된 공연 ID가 포함되어야 한다', () => {
        const body = response.body as { id: number };
        expect(body.id).toBeDefined();
      });
    });

    describe('필수 정보가 누락되면', () => {
      let response: request.Response;

      beforeAll(async () => {
        const invalidBody = {
          // performance_name 누락
          ticketing_date: new Date().toISOString(),
          venue_id: venueId,
        };

        response = await request(app.getHttpServer() as App)
          .post('/api/performances')
          .send(invalidBody);
      });

      it('HTTP 상태 코드 400을 반환해야 한다', () => {
        expect(response.status).toBe(400);
      });
    });
  });
});
