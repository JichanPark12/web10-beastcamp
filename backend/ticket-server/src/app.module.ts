import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CaptchaModule } from './captcha/captcha.module';

@Module({
  imports: [CaptchaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
