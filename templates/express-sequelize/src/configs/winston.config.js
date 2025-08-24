import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logDir = 'logs';

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(info => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`)
);

const dailyRotateTransport = new DailyRotateFile({
    dirname      : path.join(logDir),
    filename     : '%DATE%.log',
    datePattern  : 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize      : '10m',
    maxFiles     : '14d',
    level        : 'info'
});

const logger = winston.createLogger({
    format    : logFormat,
    transports: [
        dailyRotateTransport,
        new winston.transports.Console({ level: 'debug' })
    ]
});

export default logger;
