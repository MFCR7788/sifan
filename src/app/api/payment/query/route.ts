import { NextRequest, NextResponse } from 'next/server';
import { queryWechatOrder } from '@/services/wechatPay';
import { queryAlipayOrder } from '@/services/alipay';
import { getPaymentOrderByOrderNo, markOrderAsPaid, markOrderAsFailed, markOrderAsCancelled } from '@/storage/database/paymentOrderManager';
import { retryWithTimeout } from '@/utils/retry';
import { logger } from '@/utils/logger';
import { sendPaymentQueryAlert, recordPaymentProcessingTime, recordPaymentStatus, AlertLevel } from '@/utils/monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');
    const requestId = request.headers.get('x-request-id');

    const paymentLogger = logger.withContext('payment-query').withCorrelationId(requestId || '');
    paymentLogger.info('查询支付状态开始', { orderNo, requestId });

    // 记录支付处理时间开始
    const processStart = Date.now();

    if (!orderNo) {
      paymentLogger.error('订单号不能为空');
      return NextResponse.json(
        { success: false, error: '订单号不能为空' },
        { status: 400 }
      );
    }

    // 从数据库获取订单信息
    const order = await getPaymentOrderByOrderNo(orderNo);

    if (!order) {
      paymentLogger.error('订单不存在', { orderNo });
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    paymentLogger.info('获取订单信息成功', { orderNo, status: order.status, paymentMethod: order.paymentMethod });

    // 如果订单已支付，直接返回
    if (order.status === 'paid') {
      return NextResponse.json({
        success: true,
        isPaid: true,
        status: 'paid',
        order: {
          orderNo: order.orderNo,
          amount: order.amount,
          paidAt: order.paidAt,
        },
      });
    }

    // 如果订单已取消或失败，返回对应状态
    if (order.status === 'failed' || order.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        isPaid: false,
        status: order.status,
        order: {
          orderNo: order.orderNo,
          amount: order.amount,
        },
      });
    }

    // 查询第三方支付状态
    let result;

    try {
      if (order.paymentMethod === 'wechat') {
        paymentLogger.info('查询微信支付状态', { orderNo });
        result = await retryWithTimeout(async () => {
          return await queryWechatOrder(order.orderNo);
        }, 10000, 3, 1000);
      } else if (order.paymentMethod === 'alipay') {
        paymentLogger.info('查询支付宝支付状态', { orderNo });
        result = await retryWithTimeout(async () => {
          return await queryAlipayOrder(order.orderNo);
        }, 10000, 3, 1000);
      } else {
        paymentLogger.error('不支持的支付方式', { paymentMethod: order.paymentMethod });
        return NextResponse.json(
          { success: false, error: '不支持的支付方式' },
          { status: 400 }
        );
      }
      paymentLogger.info('查询第三方支付状态成功', { orderNo, paymentMethod: order.paymentMethod });
    } catch (error) {
      paymentLogger.error('查询第三方支付状态失败', error as Error, { orderNo, paymentMethod: order.paymentMethod });
      // 即使查询失败，也返回待支付状态，让前端继续轮询
      return NextResponse.json({
        success: true,
        isPaid: false,
        status: 'pending',
        paymentStatus: 'QUERY_FAILED',
        order: {
          orderNo: order.orderNo,
          amount: order.amount,
        },
        warning: '查询支付状态失败，系统将继续尝试',
      });
    }

    // 判断支付状态
    const resultAny = result as any;
    const isPaid =
      resultAny?.trade_state === 'SUCCESS' ||
      resultAny?.tradeStatus === 'TRADE_SUCCESS';
    
    // 判断支付失败或取消状态
    const isCancelled =
      resultAny?.trade_state === 'CANCELLED' ||
      resultAny?.tradeStatus === 'TRADE_CLOSED';
    
    const isFailed =
      resultAny?.trade_state === 'PAYMENT_REFUSED' ||
      resultAny?.tradeStatus === 'TRADE_FAILED';

    // 如果支付成功，调用 markOrderAsPaid 更新订单状态并执行业务逻辑
    if (isPaid) {
      try {
        // 获取交易号
        const tradeNo = resultAny?.transaction_id || '';
        const transactionId = resultAny?.transaction_id || '';

        // 使用重试机制标记订单为已支付
        paymentLogger.info('标记订单为已支付', { orderNo, tradeNo, transactionId });
        await retryWithTimeout(async () => {
          await markOrderAsPaid(order.orderNo, tradeNo, transactionId);
        }, 30000, 3, 1000);

        paymentLogger.info('支付订单已标记为已支付，业务逻辑已执行', { orderNo });

        // 记录支付处理时间
        const processDuration = Date.now() - processStart;
        await recordPaymentProcessingTime('payment_query', processDuration, order.paymentMethod, 'paid');
        
        // 记录支付状态
        await recordPaymentStatus('paid', order.paymentMethod);

        // 重新获取更新后的订单信息
        const updatedOrder = await getPaymentOrderByOrderNo(order.orderNo);

        return NextResponse.json({
          success: true,
          isPaid: true,
          status: 'paid',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: updatedOrder?.orderNo || order.orderNo,
            amount: updatedOrder?.amount || order.amount,
            paidAt: updatedOrder?.paidAt || new Date().toISOString(),
          },
        });
      } catch (markError: any) {
        paymentLogger.error('标记订单为已支付失败', markError, { orderNo });
        // 即使标记失败，也返回支付成功状态，让前端显示成功
        return NextResponse.json({
          success: true,
          isPaid: true,
          status: 'paid',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: order.orderNo,
            amount: order.amount,
          },
          warning: '订单状态更新失败，但支付已完成',
        });
      }
    }

    // 如果支付被取消，更新订单状态
    if (isCancelled) {
      try {
        // 使用重试机制标记订单为取消
        paymentLogger.info('标记订单为取消', { orderNo });
        await retryWithTimeout(async () => {
          await markOrderAsCancelled(order.orderNo);
        }, 30000, 3, 1000);
        paymentLogger.info('支付订单已标记为取消', { orderNo });

        // 记录支付处理时间
        const processDuration = Date.now() - processStart;
        await recordPaymentProcessingTime('payment_query', processDuration, order.paymentMethod, 'cancelled');
        
        // 记录支付状态
        await recordPaymentStatus('cancelled', order.paymentMethod);
        
        const updatedOrder = await getPaymentOrderByOrderNo(order.orderNo);
        
        return NextResponse.json({
          success: true,
          isPaid: false,
          status: 'cancelled',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: updatedOrder?.orderNo || order.orderNo,
            amount: updatedOrder?.amount || order.amount,
          },
        });
      } catch (cancelError: any) {
        paymentLogger.error('标记订单为取消失败', cancelError, { orderNo });
        // 即使标记失败，也返回取消状态
        return NextResponse.json({
          success: true,
          isPaid: false,
          status: 'cancelled',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: order.orderNo,
            amount: order.amount,
          },
          warning: '订单状态更新失败，但支付已取消',
        });
      }
    }
    
    // 如果支付失败，更新订单状态
    if (isFailed) {
      try {
        // 使用重试机制标记订单为失败
        paymentLogger.info('标记订单为失败', { orderNo });
        await retryWithTimeout(async () => {
          await markOrderAsFailed(order.orderNo);
        }, 30000, 3, 1000);
        paymentLogger.info('支付订单已标记为失败', { orderNo });

        // 记录支付处理时间
        const processDuration = Date.now() - processStart;
        await recordPaymentProcessingTime('payment_query', processDuration, order.paymentMethod, 'failed');
        
        // 记录支付状态
        await recordPaymentStatus('failed', order.paymentMethod);
        
        const updatedOrder = await getPaymentOrderByOrderNo(order.orderNo);
        
        return NextResponse.json({
          success: true,
          isPaid: false,
          status: 'failed',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: updatedOrder?.orderNo || order.orderNo,
            amount: updatedOrder?.amount || order.amount,
          },
        });
      } catch (failedError: any) {
        paymentLogger.error('标记订单为失败失败', failedError, { orderNo });
        // 即使标记失败，也返回失败状态
        return NextResponse.json({
          success: true,
          isPaid: false,
          status: 'failed',
          paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
          order: {
            orderNo: order.orderNo,
            amount: order.amount,
          },
          warning: '订单状态更新失败，但支付已失败',
        });
      }
    }

    // 支付未完成，返回待支付状态
    const processDuration = Date.now() - processStart;
    
    // 记录支付处理时间
    await recordPaymentProcessingTime('payment_query', processDuration, order.paymentMethod, 'pending');
    
    // 记录支付状态
    await recordPaymentStatus('pending', order.paymentMethod);
    
    paymentLogger.info('支付未完成，返回待支付状态', { orderNo, paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus });
    return NextResponse.json({
      success: true,
      isPaid: false,
      status: 'pending',
      paymentStatus: resultAny?.trade_state || resultAny?.tradeStatus,
      order: {
        orderNo: order.orderNo,
        amount: order.amount,
      },
    });
  } catch (error: unknown) {
    const requestId = request.headers.get('x-request-id');
    const paymentLogger = logger.withContext('payment-query').withCorrelationId(requestId || '');
    paymentLogger.error('查询支付状态错误', error as Error);
    
    // 发送告警
    await sendPaymentQueryAlert(
      AlertLevel.ERROR,
      '查询支付状态错误',
      { error: (error as Error).message, stack: (error as Error).stack },
      requestId
    );
    
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '查询支付状态失败' },
      { status: 500 }
    );
  }
}
