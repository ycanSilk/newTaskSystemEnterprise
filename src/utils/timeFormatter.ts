import logConfig from '../config/logConfig.json';

export interface TimeFormatterConfig {
  timezone?: string;
  locale?: string;
  format?: string;
}

const DEFAULT_TIMEZONE = 'Asia/Shanghai';
const DEFAULT_LOCALE = 'zh-CN';
const DEFAULT_FORMAT = 'YYYY-MM-DD HH:mm:ss.SSS';

export class TimeFormatter {
  private timezone: string;
  private locale: string;

  constructor(config?: TimeFormatterConfig) {
    this.timezone = config?.timezone || logConfig.timezone || DEFAULT_TIMEZONE;
    this.locale = config?.locale || DEFAULT_LOCALE;
  }

  private getFormatter(): Intl.DateTimeFormat {
    return new Intl.DateTimeFormat(this.locale, {
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  format(date: Date = new Date()): string {
    const formatter = this.getFormatter();
    const parts = formatter.formatToParts(date);
    
    const year = parts.find(p => p.type === 'year')?.value || '';
    const month = parts.find(p => p.type === 'month')?.value || '';
    const day = parts.find(p => p.type === 'day')?.value || '';
    const hours = parts.find(p => p.type === 'hour')?.value || '';
    const minutes = parts.find(p => p.type === 'minute')?.value || '';
    const seconds = parts.find(p => p.type === 'second')?.value || '';
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  }

  getCurrentDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  }

  getBeijingTime(): string {
    return this.format();
  }
}

export const timeFormatter = new TimeFormatter();
