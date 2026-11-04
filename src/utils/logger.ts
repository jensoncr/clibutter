import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `[${timestamp}] ${level}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

export const log = {
  info: (message: string) => logger.info(message),
  error: (message: string, error?: Error) => {
    if (error) {
      logger.error(`${message}: ${error.message}\n${error.stack}`);
    } else {
      logger.error(message);
    }
  },
  warn: (message: string) => logger.warn(message),
  debug: (message: string) => logger.debug(message)
};

export default log; 