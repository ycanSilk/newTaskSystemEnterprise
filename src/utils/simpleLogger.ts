import fs from 'fs';
import path from 'path';
import logConfig from '../config/logConfig.json';

export enum LogType {
  AUDIT = 'audit',
  API = 'api',
  JS = 'js'
}

class SimpleLogger {
  private logDir: string;
  private auditDir: string;
  private timezone: string;

  constructor() {
    const os = logConfig.system as 'windows' | 'linux';
    this.logDir = logConfig.logRootDirs[os];
    this.auditDir = logConfig.auditRootDirs[os];
    this.timezone = logConfig.timezone || 'Asia/Shanghai';
  }

  private getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private getBeijingTime(): string {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('zh-CN', {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(now);
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    const hours = parts.find(p => p.type === 'hour')?.value || '';
    const minutes = parts.find(p => p.type === 'minute')?.value || '';
    const seconds = parts.find(p => p.type === 'second')?.value || '';
    const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  private getLogFilePath(logType: LogType): string {
    const date = this.getCurrentDate();
    const fileName = logConfig[`${logType}LogFile` as keyof typeof logConfig];

    switch (logType) {
      case LogType.AUDIT:
        return path.join(this.auditDir, `${date}.log`);
      case LogType.API:
        return path.join(this.logDir, `${date}.log`);
      case LogType.JS:
        return path.join(this.logDir, `${date}.log`);
      default:
        return path.join(this.logDir, `${date}.log`);
    }
  }

  private ensureDirectoryExists(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private writeToFile(logType: LogType, message: string): void {
    const timestamp = this.getBeijingTime();
    const logLine = `[${timestamp}] ${message}`;
    const filePath = this.getLogFilePath(logType);

    try {
      this.ensureDirectoryExists(filePath);
      fs.appendFileSync(filePath, logLine + '\n', 'utf-8');
      console.log(`[LOG-WRITE] ${logType.toUpperCase()} - ${filePath}`);
    } catch (error) {
      console.error(`[LOG-WRITE-ERROR] Failed to write to ${filePath}:`, error);
    }
  }

  private logAndWrite(logType: LogType, message: string): void {
    console.log(message);
    this.writeToFile(logType, message);
  }

  audit(operation: string, action: string, details?: any): void {
    const message = `${operation}: ${action} - ${details ? JSON.stringify(details) : '{}'}`;
    this.logAndWrite(LogType.AUDIT, message);
  }

  api(endpoint: string, message: string): void {
    this.logAndWrite(LogType.API, `${endpoint} - ${message}`);
  }

  js(context: string, message: string): void {
    this.logAndWrite(LogType.JS, `${context} - ${message}`);
  }

  error(endpoint: string, message: string): void {
    console.error(message);
    this.writeToFile(LogType.JS, message);
  }
}

export const logger = new SimpleLogger();
