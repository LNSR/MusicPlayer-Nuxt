import fs from 'fs';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};

const DEFAULT_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const LOG_FILE = process.env.LOG_FILE || null;

function shouldLog(level: LogLevel) {
  return LEVELS[level] >= LEVELS[DEFAULT_LEVEL];
}

function formatEntry(level: LogLevel, message: string, meta?: Record<string, any>) {
  const entry = {
    time: new Date().toISOString(),
    pid: process.pid,
    level,
    message,
    ...(meta ? { meta } : {}),
  };
  return JSON.stringify(entry);
}

async function writeToFile(line: string) {
  if (!LOG_FILE) return;
  try {
    await fs.promises.appendFile(LOG_FILE, line + '\n', { encoding: 'utf8' });
  } catch (e) {
    // don't throw from logger
    // fallback to console if file write fails
    // eslint-disable-next-line no-console
    console.error('Failed to write log to file', e);
  }
}

export const logger = {
  debug(message: string, meta?: Record<string, any>) {
    if (!shouldLog('debug')) return;
    const line = formatEntry('debug', message, meta);
    // eslint-disable-next-line no-console
    console.debug(line);
    void writeToFile(line);
  },
  info(message: string, meta?: Record<string, any>) {
    if (!shouldLog('info')) return;
    const line = formatEntry('info', message, meta);
    // eslint-disable-next-line no-console
    console.info(line);
    void writeToFile(line);
  },
  warn(message: string, meta?: Record<string, any>) {
    if (!shouldLog('warn')) return;
    const line = formatEntry('warn', message, meta);
    // eslint-disable-next-line no-console
    console.warn(line);
    void writeToFile(line);
  },
  error(message: string, meta?: Record<string, any>) {
    if (!shouldLog('error')) return;
    const line = formatEntry('error', message, meta);
    // eslint-disable-next-line no-console
    console.error(line);
    void writeToFile(line);
  },
};

export default logger;
