import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('공연장 (Venues) API', () => {
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

  describe('POST /api/venues 요청 시', () => {
    describe('유효한 공연장 이름이 주어지면', () => {
      const validBody = { venue_name: '올림픽 체조경기장' };
      let response: request.Response;

      beforeAll(async () => {
        response = await request(app.getHttpServer() as App)
          .post('/api/venues')
          .send(validBody);
      });

      it('HTTP 상태 코드 201을 반환해야 한다', () => {
        expect(response.status).toBe(201);
      });

      it('응답 본문에 생성된 ID가 포함되어야 한다', () => {
        const body = response.body as { id: number };
        expect(body.id).toBeDefined();
      });
    });

    describe('공연장 이름(venue_name)이 누락되면', () => {
      const invalidBody = {};
      let response: request.Response;

      beforeAll(async () => {
        response = await request(app.getHttpServer() as App)
          .post('/api/venues')
          .send(invalidBody);
      });

      it('HTTP 상태 코드 400을 반환해야 한다', () => {
        expect(response.status).toBe(400);
      });
    });
  });

  describe('GET /api/venues 요청 시', () => {
    describe('저장된 공연장이 있다면', () => {
      beforeAll(async () => {
        await request(app.getHttpServer() as App)
          .post('/api/venues')
          .send({ venue_name: '장충 체육관' });

        await request(app.getHttpServer() as App)
          .post('/api/venues')
          .send({ venue_name: '올림픽 체조경기장' });
      });

      let response: request.Response;

      beforeAll(async () => {
        response = await request(app.getHttpServer() as App).get('/api/venues');
      });

      it('HTTP 상태 코드 200을 반환해야 한다', () => {
        expect(response.status).toBe(200);
      });

      it('응답 본문에 공연장 목록이 포함되어야 한다', () => {
        const body = response.body as {
          venues: { id: number; venue_name: string }[];
        };
        expect(body.venues).toBeDefined();
        expect(Array.isArray(body.venues)).toBe(true);
        expect(body.venues.length).toBeGreaterThanOrEqual(2);
      });

      it('생성된 공연장 이름들이 목록에 존재해야 한다', () => {
        const body = response.body as {
          venues: { id: number; venue_name: string }[];
        };
        const venueNames = body.venues.map((v) => v.venue_name);
        expect(venueNames).toContain('장충 체육관');
        expect(venueNames).toContain('올림픽 체조경기장');
      });
    });
  });
});
