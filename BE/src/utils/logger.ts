import winston from 'winston';
import { env } from '@/config/env';

const { combine, timestamp, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: env.isDev() ? 'debug' : 'info',
  format: combine(timestamp(), json()),
  transports: [
    new winston.transports.Console({
      format: env.isDev() ? combine(colorize(), simple()) : combine(timestamp(), json()),
    }),
  ],
});
