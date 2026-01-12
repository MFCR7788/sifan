import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
import path from 'path';

// 初始化微信支付实例
let pay: WxPay | null = null;

try {
  const privateKeyPath = process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '';
  const certPath = process.env.WECHAT_PAY_CERT_PATH || '';

  const privateKeyContent = fs.existsSync(privateKeyPath)
    ? fs.readFileSync(privateKeyPath)
    : Buffer.from('');

  const config: any = {
    appid: process.env.WECHAT_PAY_APPID || '',
    mchid: process.env.WECHAT_PAY_MCHID || '',
    privateKey: privateKeyContent,
  };

  if (process.env.WECHAT_PAY_SERIAL_NO) {
    config.serial_no = process.env.WECHAT_PAY_SERIAL_NO;
  }

  if (fs.existsSync(certPath)) {
    config.publicKey = fs.readFileSync(certPath);
  }

  pay = new WxPay(config);
} catch (error) {
  console.warn('微信支付SDK初始化失败，可能是缺少证书配置');
}

export interface CreateOrderParams {
  description: string;
  out_trade_no: string;
  amount: number; // 单位：分
}

export interface CreateOrderResult {
  code_url: string;
  prepay_id: string;
}

/**
 * 创建微信支付 Native Pay 订单
 */
export async function createWechatNativePay(
  params: CreateOrderParams
): Promise<CreateOrderResult> {
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    const result = await pay.transactions_native({
      description: params.description,
      out_trade_no: params.out_trade_no,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
      amount: {
        total: params.amount,
        currency: 'CNY',
      },
    }) as any;

    return {
      code_url: result?.code_url || '',
      prepay_id: result?.prepay_id || '',
    };
  } catch (error: any) {
    console.error('WeChat Pay Create Error:', error);
    throw new Error(error.message || '创建微信支付订单失败');
  }
}

/**
 * 查询微信支付订单
 */
export async function queryWechatOrder(orderNo: string) {
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    const result = await pay.query({ out_trade_no: orderNo });
    return result;
  } catch (error: any) {
    console.error('WeChat Pay Query Error:', error);
    throw new Error(error.message || '查询微信支付订单失败');
  }
}

/**
 * 关闭微信支付订单
 */
export async function closeWechatOrder(orderNo: string) {
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    const result = await (pay as any).close({
      out_trade_no: orderNo,
    });
    return result;
  } catch (error: any) {
    console.error('WeChat Pay Close Error:', error);
    throw new Error(error.message || '关闭微信支付订单失败');
  }
}

/**
 * 退款
 */
export async function refundWechatOrder(
  out_trade_no: string,
  out_refund_no: string,
  total: number,
  refund: number
) {
  if (!pay) {
    throw new Error('微信支付未初始化');
  }

  try {
    const result = await (pay as any).refunds.create({
      out_trade_no,
      out_refund_no,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/refund/notify`,
      amount: {
        refund,
        total,
        currency: 'CNY',
      },
    });
    return result;
  } catch (error: any) {
    console.error('WeChat Pay Refund Error:', error);
    throw new Error(error.message || '微信退款失败');
  }
}
