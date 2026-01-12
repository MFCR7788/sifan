import { NextRequest, NextResponse } from 'next/server';
import { createWechatNativePay } from '@/services/wechatPay';
import { createAlipayQrPay } from '@/services/alipay';
import QRCode from 'qrcode';
import { createPaymentOrder } from '@/storage/database/paymentOrderManager';
import { useAuth } from '@/contexts/AuthContext';

export async function POST(request: NextRequest) {
  try {
    // 获取用户身份 - 支持从 Cookie 和 Header 两种方式读取
    const allCookies = request.cookies.getAll();
    let userId = request.cookies.get('userId')?.value;

    // 备选方案：从自定义 header 中读取（解决 localhost cookie 不发送的问题）
    if (!userId) {
      userId = request.headers.get('x-user-id');
      console.log('Cookie 中无 userId，尝试从 Header 读取:', userId);
    }

    // 详细日志：调试 cookie/header 读取
    console.log('=== 支付接口认证调试 ===');
    console.log('Cookie数量:', allCookies.length);
    console.log('所有Cookie:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 10) + '...' })));
    console.log('Cookie userId:', request.cookies.get('userId')?.value);
    console.log('Header userId:', request.headers.get('x-user-id'));
    console.log('最终 userId:', userId);
    console.log('==========================');

    if (!userId) {
      console.warn('⚠️ 支付接口: 未登录 - Cookie 和 Header 中都不存在 userId');
      return NextResponse.json(
        { success: false, error: '用户未登录，请刷新页面重试或重新登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { paymentMethod, amount, description, type, metadata = {} } = body;

    // 验证参数
    if (!paymentMethod || !amount || !description || !type) {
      return NextResponse.json(
        { success: false, error: '参数不完整' },
        { status: 400 }
      );
    }

    // 验证支付方式
    if (!['wechat', 'alipay'].includes(paymentMethod)) {
      return NextResponse.json(
        { success: false, error: '不支持的支付方式' },
        { status: 400 }
      );
    }

    // 验证订单类型
    if (!['recharge', 'membership', 'points'].includes(type)) {
      return NextResponse.json(
        { success: false, error: '不支持的订单类型' },
        { status: 400 }
      );
    }

    // 金额验证
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '金额必须大于0' },
        { status: 400 }
      );
    }

    let qrCodeUrl = '';
    let transactionId = '';

    // 创建支付订单
    const order = await createPaymentOrder({
      userId,
      orderType: type,
      amount: Math.round(amount * 100), // 转换为分
      paymentMethod,
      description,
      metadata,
    });

    // 调用支付接口
    if (paymentMethod === 'wechat') {
      // 检查是否为开发环境，如果是，使用模拟支付
      const isDev = process.env.NODE_ENV === 'development';

      if (isDev && !process.env.WECHAT_PAY_ENABLE_REAL) {
        // 开发环境：使用模拟支付
        console.log('=== 使用模拟支付（开发环境）===');
        // 使用一个假的 code_url 用于测试
        qrCodeUrl = `https://pay.weixin.qq.com/mock?q=${order.orderNo}`;
        transactionId = `mock_${order.orderNo}`;
      } else {
        // 生产环境：调用真实的微信支付接口
        console.log('=== 调用微信支付接口 ===');
        console.log('参数:', {
          description,
          out_trade_no: order.orderNo,
          amount: Math.round(amount * 100),
        });

        try {
          const result = await createWechatNativePay({
            description,
            out_trade_no: order.orderNo,
            amount: Math.round(amount * 100),
          });

          console.log('微信支付返回结果:', result);
          qrCodeUrl = result.code_url;
          transactionId = result.prepay_id;

          if (!qrCodeUrl) {
            throw new Error('微信支付接口未返回 code_url');
          }
        } catch (wechatError: any) {
          console.error('❌ 微信支付接口调用失败:', wechatError.message);
          console.error('错误详情:', wechatError);
          throw new Error(`微信支付失败: ${wechatError.message}`);
        }
      }
    } else if (paymentMethod === 'alipay') {
      // 支付宝（单位：元）
      const result = await createAlipayQrPay({
        outTradeNo: order.orderNo,
        totalAmount: amount,
        subject: description,
      });
      qrCodeUrl = result.qr_code;
      transactionId = result.out_trade_no;
    }

    // 生成二维码图片（Base64）
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // 更新订单的二维码链接和交易ID
    // TODO: 更新订单

    return NextResponse.json({
      success: true,
      orderNo: order.orderNo,
      orderId: order.id,
      transactionId,
      qrCodeImage,
      amount: amount,
    });
  } catch (error: any) {
    console.error('Create Payment Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || '创建支付订单失败' },
      { status: 500 }
    );
  }
}
