import winston from 'winston'
import 'winston-daily-rotate-file'
import path from 'path'

function createLogger() {
  return winston.createLogger({
    transports: [
      new winston.transports.Console(),
      new winston.transports.DailyRotateFile({
        dirname: path.resolve(__dirname, '../var/log'),
        filename: 'app-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        maxSize: '20m',
        maxFiles: '14d',
      }),
    ],
  })
}

export default createLogger
