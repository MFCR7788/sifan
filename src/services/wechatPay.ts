import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
import path from 'path';

// 初始化微信支付实例
let pay: WxPay | null = null;

try {
  const privateKeyPath = process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '';
  const certPath = process.env.WECHAT_PAY_CERT_PATH || '';

  console.log('=== 微信支付 SDK 初始化 ===');
  console.log('私钥路径:', privateKeyPath);
  console.log('证书路径:', certPath);
  console.log('私钥文件存在:', fs.existsSync(privateKeyPath));
  console.log('证书文件存在:', fs.existsSync(certPath));
  console.log('APPID:', process.env.WECHAT_PAY_APPID);
  console.log('MCHID:', process.env.WECHAT_PAY_MCHID);
  console.log('API V3 KEY 已配置:', !!process.env.WECHAT_PAY_API_V3_KEY);
  console.log('SERIAL NO 已配置:', !!process.env.WECHAT_PAY_SERIAL_NO);

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

  console.log('配置:', {
    appid: config.appid,
    mchid: config.mchid,
    hasPrivateKey: !!config.privateKey,
    hasPublicKey: !!config.publicKey,
    hasSerialNo: !!config.serial_no,
  });

  pay = new WxPay(config);
  console.log('✅ 微信支付 SDK 初始化成功');
  console.log('========================');
} catch (error: any) {
  console.error('❌ 微信支付 SDK 初始化失败:', error.message);
  console.error(error.stack);
  console.warn('⚠️ 支付功能将不可用');
  console.log('========================');
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
  console.log('=== createWechatNativePay 调用 ===');
  console.log('pay 实例:', pay ? '已初始化' : 'null');

  if (!pay) {
    const errorMsg = '微信支付未初始化，请检查证书配置和环境变量';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  try {
    console.log('创建订单参数:', params);

    const result = await pay.transactions_native({
      description: params.description,
      out_trade_no: params.out_trade_no,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
      amount: {
        total: params.amount,
        currency: 'CNY',
      },
    }) as any;

    console.log('微信支付 API 返回:', result);
    console.log('code_url:', result?.code_url);
    console.log('prepay_id:', result?.prepay_id);

    // 打印完整的返回数据结构，方便调试
    console.log('完整返回数据 JSON:', JSON.stringify(result, null, 2));
    console.log('返回数据所有字段:', Object.keys(result));

    // 尝试从不同的字段中获取 code_url
    let codeUrl = result?.code_url;
    if (!codeUrl && result?.data?.code_url) {
      codeUrl = result.data.code_url;
      console.log('从 result.data.code_url 获取到:', codeUrl);
    }
    if (!codeUrl && result?.code_url) {
      codeUrl = result.code_url;
      console.log('从 result.code_url 获取到:', codeUrl);
    }

    if (!codeUrl) {
      console.error('❌ 微信支付 API 返回的 code_url 为空');
      throw new Error('微信支付接口返回数据异常：缺少 code_url');
    }

    return {
      code_url: codeUrl,
      prepay_id: result?.prepay_id || '',
    };
  } catch (error: any) {
    console.error('❌ WeChat Pay Create Error:', error.message);
    console.error('错误详情:', error);
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
