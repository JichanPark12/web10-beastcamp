import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://web10-beastcamp.vercel.app',
      'https://www.web10.site',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('대기열 API 서버')
    .setDescription('티켓팅 시스템을 위한 대기열 관리 API 문서입니다.')
    .setVersion('1.0.0')
    .addCookieAuth('waiting-token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'waiting-token',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      withCredentials: true,
    },
  });

  await app.listen(Number(process.env.PORT ?? 3003));
}
void bootstrap();
