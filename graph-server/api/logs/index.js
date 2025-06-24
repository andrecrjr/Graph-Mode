import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Define __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define custom log format
const logFormat = format.printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message} ${process.env.NODE_ENV === 'development' ? ":: dev-mode" : ""}`;
});

// Create logger
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
    }),
    new transports.File({
      filename: join(__dirname, 'debug', 'combined.log'),
      level: 'info',
      maxsize: 4096, // 4KB
      maxFiles: 1,
    }),
    new transports.File({
      filename: join(__dirname, 'debug', 'error.log'),
      level: 'error',
      maxsize: 1048576, // 1MB
      maxFiles: 10,
    }),
    new transports.File({
      filename: join(__dirname, 'debug', 'redis.log'),
      level: 'cache',
      maxsize: 1048576, // 1MB
      maxFiles: 10,
    }),
  ],
});

// If in development mode, use more readable logging
if (process.env.NODE_ENV === 'development') {
  logger.add(new transports.File({
    filename: join(__dirname, 'debug', 'development.log'),
    level: 'debug',
    maxsize: 1048576, // 1MB
    maxFiles: 10,
  }));
}

export default logger;
