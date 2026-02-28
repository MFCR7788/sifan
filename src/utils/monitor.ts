/**
 * 监控告警工具
 */

import { logger } from './logger';

/**
 * 告警级别
 */
export enum AlertLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

/**
 * 告警类型
 */
export enum AlertType {
  PAYMENT_CALLBACK = 'payment_callback',
  PAYMENT_QUERY = 'payment_query',
  DATABASE = 'database',
  API = 'api',
  SYSTEM = 'system',
}

/**
 * 告警数据
 */
export interface AlertData {
  level: AlertLevel;
  type: AlertType;
  message: string;
  details?: any;
  timestamp: Date;
  correlationId?: string | null;
}

/**
 * 监控服务接口
 */
export interface MonitorService {
  sendAlert(alert: AlertData): Promise<void>;
  recordMetric(name: string, value: number, labels?: Record<string, string>): Promise<void>;
}

/**
 * 默认监控服务实现
 */
export class DefaultMonitorService implements MonitorService {
  async sendAlert(alert: AlertData): Promise<void> {
    // 这里可以集成第三方监控服务，如 Prometheus Alertmanager、Sentry 等
    // 目前实现为日志输出
    const monitorLogger = logger.withContext('monitor');
    
    switch (alert.level) {
      case AlertLevel.INFO:
        monitorLogger.info('告警', alert);
        break;
      case AlertLevel.WARN:
        monitorLogger.warn('告警', alert);
        break;
      case AlertLevel.ERROR:
        monitorLogger.error('告警', alert);
        break;
      case AlertLevel.CRITICAL:
        monitorLogger.fatal('告警', alert);
        break;
    }

    // 模拟告警发送
    console.log('📢 发送告警:', {
      level: alert.level,
      type: alert.type,
      message: alert.message,
      correlationId: alert.correlationId,
      timestamp: alert.timestamp.toISOString(),
    });
  }

  async recordMetric(name: string, value: number, labels?: Record<string, string>): Promise<void> {
    // 这里可以集成 Prometheus 等监控系统
    // 目前实现为日志输出
    const monitorLogger = logger.withContext('monitor');
    monitorLogger.debug('记录指标', { name, value, labels });
  }
}

// 创建默认监控服务实例
export const monitorService = new DefaultMonitorService();

/**
 * 发送支付回调告警
 */
export async function sendPaymentCallbackAlert(
  level: AlertLevel,
  message: string,
  details?: any,
  correlationId?: string | null
): Promise<void> {
  await monitorService.sendAlert({
    level,
    type: AlertType.PAYMENT_CALLBACK,
    message,
    details,
    timestamp: new Date(),
    correlationId,
  });
}

/**
 * 发送支付查询告警
 */
export async function sendPaymentQueryAlert(
  level: AlertLevel,
  message: string,
  details?: any,
  correlationId?: string | null
): Promise<void> {
  await monitorService.sendAlert({
    level,
    type: AlertType.PAYMENT_QUERY,
    message,
    details,
    timestamp: new Date(),
    correlationId,
  });
}

/**
 * 记录支付处理时间
 */
export async function recordPaymentProcessingTime(
  step: string,
  duration: number,
  paymentMethod?: string,
  status?: string
): Promise<void> {
  await monitorService.recordMetric('payment_processing_time', duration, {
    step,
    paymentMethod: paymentMethod || 'unknown',
    status: status || 'unknown',
  });
}

/**
 * 记录支付状态
 */
export async function recordPaymentStatus(
  status: string,
  paymentMethod: string
): Promise<void> {
  await monitorService.recordMetric('payment_status', 1, {
    status,
    paymentMethod,
  });
}
