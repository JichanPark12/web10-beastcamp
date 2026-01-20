import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS 설정
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // 프론트엔드 URL
    credentials: true,
    exposedHeaders: ['X-Captcha-Id'], // 커스텀 헤더 노출
  });

  await app.listen(process.env.PORT ?? 3001);
}
void bootstrap();
