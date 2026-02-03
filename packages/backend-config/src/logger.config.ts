import { LoggerService } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

/**
 * 모든 서버에서 공통으로 사용할 Winston 로거 설정을 반환합니다.
 * @param serviceName 서버 식별자 (예: 'api-server', 'ticket-server', 'queue-backend')
 */
export const getWinstonLogger = (serviceName: string): LoggerService => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.ms(),
          winston.format.label({ label: serviceName }),
          winston.format.json(),
        ),
      }),
    ],
  });
};
