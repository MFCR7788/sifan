/**
 * 日志级别
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 日志配置选项
 */
export interface LoggerOptions {
  level?: LogLevel;
  context?: string;
  correlationId?: string;
}

/**
 * 结构化日志工具
 */
export class Logger {
  private context?: string;
  private correlationId?: string;
  private level: LogLevel;

  constructor(options: LoggerOptions = {}) {
    this.context = options.context;
    this.correlationId = options.correlationId;
    this.level = options.level || LogLevel.INFO;
  }

  /**
   * 创建带有上下文的日志实例
   */
  withContext(context: string): Logger {
    return new Logger({
      level: this.level,
      context,
      correlationId: this.correlationId,
    });
  }

  /**
   * 创建带有关联ID的日志实例
   */
  withCorrelationId(correlationId: string): Logger {
    return new Logger({
      level: this.level,
      context: this.context,
      correlationId,
    });
  }

  /**
   * 调试日志
   */
  debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.log(LogLevel.DEBUG, message, data);
    }
  }

  /**
   * 信息日志
   */
  info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.log(LogLevel.INFO, message, data);
    }
  }

  /**
   * 警告日志
   */
  warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.log(LogLevel.WARN, message, data);
    }
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.log(LogLevel.ERROR, message, {
        ...data,
        error: error?.message,
        stack: error?.stack,
      });
    }
  }

  /**
   * 致命错误日志
   */
  fatal(message: string, error?: Error, data?: any): void {
    if (this.shouldLog(LogLevel.FATAL)) {
      this.log(LogLevel.FATAL, message, {
        ...data,
        error: error?.message,
        stack: error?.stack,
      });
    }
  }

  /**
   * 支付相关日志
   */
  payment(message: string, data?: any): void {
    this.info(`[PAYMENT] ${message}`, {
      ...data,
      type: 'payment',
    });
  }

  /**
   * 回调相关日志
   */
  webhook(message: string, data?: any): void {
    this.info(`[WEBHOOK] ${message}`, {
      ...data,
      type: 'webhook',
    });
  }

  /**
   * 数据库相关日志
   */
  database(message: string, data?: any): void {
    this.info(`[DATABASE] ${message}`, {
      ...data,
      type: 'database',
    });
  }

  /**
   * 实际日志记录方法
   */
  private log(level: LogLevel, message: string, data?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.context,
      correlationId: this.correlationId,
      ...data,
    };

    // 根据日志级别使用不同的控制台方法
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(logEntry);
        break;
      case LogLevel.INFO:
        console.info(logEntry);
        break;
      case LogLevel.WARN:
        console.warn(logEntry);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(logEntry);
        break;
    }
  }

  /**
   * 判断是否应该记录该级别的日志
   */
  private shouldLog(level: LogLevel): boolean {
    const levelOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    return levelOrder.indexOf(level) >= levelOrder.indexOf(this.level);
  }
}

// 创建默认日志实例
export const logger = new Logger();
