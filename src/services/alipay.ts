import { AlipaySdk } from 'alipay-sdk';

/**
 * 获取支付宝 SDK 实例（延迟初始化）
 */
function getAlipaySdk(): AlipaySdk {
  if (!process.env.ALIPAY_APPID || !process.env.ALIPAY_PRIVATE_KEY || !process.env.ALIPAY_PUBLIC_KEY) {
    throw new Error('支付宝配置不完整，请检查 .env.local 文件中的 ALIPAY_APPID、ALIPAY_PRIVATE_KEY 和 ALIPAY_PUBLIC_KEY');
  }

  return new AlipaySdk({
    appId: process.env.ALIPAY_APPID,
    privateKey: process.env.ALIPAY_PRIVATE_KEY,
    alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    charset: 'utf-8',
    version: '1.0',
    signType: 'RSA2',
  });
}

export interface CreateAlipayQrParams {
  outTradeNo: string;
  totalAmount: number; // 单位：元
  subject: string;
  body?: string;
}

export interface CreateAlipayQrResult {
  qr_code: string;
  out_trade_no: string;
}

/**
 * 创建支付宝当面付二维码订单
 */
export async function createAlipayQrPay(
  params: CreateAlipayQrParams
): Promise<CreateAlipayQrResult> {
  try {
    const alipay = getAlipaySdk();
    const result = await alipay.exec('alipay.trade.precreate', {
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/alipay/notify`,
      bizContent: {
        out_trade_no: params.outTradeNo,
        total_amount: params.totalAmount.toString(),
        subject: params.subject,
        body: params.body || params.subject,
      },
    });

    return {
      qr_code: result.qrCode,
      out_trade_no: result.outTradeNo,
    };
  } catch (error: any) {
    console.error('Alipay Create Error:', error);
    throw new Error(error.message || '创建支付宝订单失败');
  }
}

/**
 * 查询支付宝订单
 */
export async function queryAlipayOrder(orderNo: string) {
  try {
    const alipay = getAlipaySdk();
    const result = await alipay.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderNo,
      },
    });
    return result;
  } catch (error: any) {
    console.error('Alipay Query Error:', error);
    throw new Error(error.message || '查询支付宝订单失败');
  }
}

/**
 * 关闭支付宝订单
 */
export async function closeAlipayOrder(orderNo: string) {
  try {
    const alipay = getAlipaySdk();
    const result = await alipay.exec('alipay.trade.close', {
      bizContent: {
        out_trade_no: orderNo,
      },
    });
    return result;
  } catch (error: any) {
    console.error('Alipay Close Error:', error);
    throw new Error(error.message || '关闭支付宝订单失败');
  }
}

/**
 * 支付宝退款
 */
export async function refundAlipayOrder(
  outTradeNo: string,
  outRequestNo: string,
  refundAmount: number,
  totalAmount: number
) {
  try {
    const alipay = getAlipaySdk();
    const result = await alipay.exec('alipay.trade.refund', {
      bizContent: {
        out_trade_no: outTradeNo,
        out_request_no: outRequestNo,
        refund_amount: refundAmount.toString(),
        total_amount: totalAmount.toString(),
      },
    });
    return result;
  } catch (error: any) {
    console.error('Alipay Refund Error:', error);
    throw new Error(error.message || '支付宝退款失败');
  }
}
