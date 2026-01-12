import { NextRequest, NextResponse } from 'next/server';
import { createWechatNativePay } from '@/services/wechatPay';
import { createAlipayQrPay } from '@/services/alipay';
import QRCode from 'qrcode';
import { createPaymentOrder } from '@/storage/database/paymentOrderManager';
import { useAuth } from '@/contexts/AuthContext';

export async function POST(request: NextRequest) {
  try {
    // 获取用户身份
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      console.log('Payment Create: 未登录，Cookie信息:', request.cookies.getAll());
      return NextResponse.json(
        { success: false, error: '用户未登录' },
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
      // 微信支付（单位：分）
      const result = await createWechatNativePay({
        description,
        out_trade_no: order.orderNo,
        amount: Math.round(amount * 100),
      });
      qrCodeUrl = result.code_url;
      transactionId = result.prepay_id;
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
