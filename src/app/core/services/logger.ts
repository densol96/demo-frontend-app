import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

type LogLevel = 'info' | 'warn' | 'error' | 'success';

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly enabled = !environment.production;
  private readonly colorMap = {
    info: '#2563eb',
    warn: '#f59e0b',
    error: '#dc2626',
    success: '#16a34a',
  } as const;

  info(ctx: string, msg: string, data?: unknown) {
    this.log('info', ctx, msg, data);
  }

  success(ctx: string, msg: string, data?: unknown) {
    this.log('success', ctx, msg, data);
  }

  warn(ctx: string, msg: string, data?: unknown) {
    this.log('warn', ctx, msg, data);
  }

  error(ctx: string, msg: string, data?: unknown) {
    this.log('error', ctx, msg, data);
  }

  private log(level: LogLevel, context: string, message: string, data?: unknown) {
    if (!this.enabled) return;

    const color = this.selectColor(level);
    const icon = this.selectIcon(level);
    const logFn = this.selectLogFn(level);
    const timestamp = new Date().toLocaleTimeString();

    logFn(
      `%c[${timestamp}] %c[${context}] ${icon} ${message}`,
      'color: gray; font-weight: 500;', // timestamp style
      `color: ${color}; font-weight: 600;`, // main label color
      data ?? ''
    );
  }

  private selectColor(level: LogLevel) {
    return this.colorMap[level];
  }

  private selectIcon(level: LogLevel) {
    switch (level) {
      case 'error':
        return '✗';
      case 'warn':
        return '⚠️';
      case 'success':
        return '✓';
      case 'info':
      default:
        return 'ℹ️';
    }
  }

  private selectLogFn(level: LogLevel) {
    switch (level) {
      case 'error':
        return console.error;
      case 'warn':
        return console.warn;
      default:
        return console.log;
    }
  }
}
