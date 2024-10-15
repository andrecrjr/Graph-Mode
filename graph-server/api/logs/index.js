import { createLogger, format, transports } from 'winston'
const { combine, timestamp, printf, errors, json } = format;

// Define custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Create logger
const logger = createLogger({
  level: 'info', // Minimum log level (debug, info, warn, error)
  format: combine(
    timestamp(),      // Add timestamps
    errors({ stack: true }),  // Log error stack traces
    json(),          // Log in JSON format (useful for structured logging)
  ),
  transports: [
    new transports.Console(),  // Log to console
    new transports.File({ filename: '/logs/error.log', level: 'error' }), // Error logs in a file
    new transports.File({ filename: '/logs/combined.log' }),  // All logs in another file
  ],
});

// If in development mode, use more readable logging
if (process.env.NODE_ENV === 'development') {
  logger.add(new transports.Console({
    format: combine(
      timestamp(),
      logFormat // Use the custom format in dev mode
    )
  }));
}

export default logger;