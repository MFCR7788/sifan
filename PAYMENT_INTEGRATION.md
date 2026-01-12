# 支付对接方案

## 前置条件

### 微信支付
1. 注册微信支付商户账号：https://pay.weixin.qq.com/
2. 获取以下信息：
   - 商户号（mchid）
   - API v3 密钥（API v3 Key）
   - API 证书（apiclient_key.pem、apiclient_cert.pem）
   - 商户序列号（serial_no）
   - 商户 API 证书

### 支付宝
1. 注册支付宝开放平台：https://open.alipay.com/
2. 获取以下信息：
   - APPID
   - 应用私钥
   - 支付宝公钥
   - 应用网关地址

## 对接步骤

### 第一步：安装依赖

```bash
pnpm add wechatpay-node-v3
pnpm add alipay-sdk
pnpm add qrcode
```

### 第二步：配置环境变量

在 `.env.local` 文件中添加：

```env
# 微信支付配置
WECHAT_PAY_MCHID=your_mchid
WECHAT_PAY_SERIAL_NO=your_serial_no
WECHAT_PAY_API_V3_KEY=your_api_v3_key
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem

# 支付宝配置
ALIPAY_APPID=your_appid
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=your_public_key
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

### 第三步：创建支付服务类

### 微信支付封装

```typescript
// src/services/wechatPay.ts
import WxPay from 'wechatpay-node-v3';
import fs from 'fs';
import path from 'path';

const pay = new WxPay({
  appid: process.env.WECHAT_PAY_APPID || '',
  mchid: process.env.WECHAT_PAY_MCHID || '',
  private_key: fs.readFileSync(
    path.join(process.cwd(), process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '')
  ),
  serial_no: process.env.WECHAT_PAY_SERIAL_NO || '',
  apiclient_key: fs.readFileSync(
    path.join(process.cwd(), process.env.WECHAT_PAY_CERT_PATH || '')
  ),
});

export interface CreateOrderParams {
  description: string;
  out_trade_no: string;
  amount: number;
}

export async function createWechatNativePay(params: CreateOrderParams) {
  try {
    const result = await pay.transactions_native({
      description: params.description,
      out_trade_no: params.out_trade_no,
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/wechat/notify`,
      amount: {
        total: params.amount, // 单位：分
        currency: 'CNY',
      },
    });

    return {
      code_url: result.code_url,
      prepay_id: result.prepay_id,
    };
  } catch (error) {
    console.error('WeChat Pay Error:', error);
    throw new Error('创建微信支付订单失败');
  }
}

export async function queryWechatOrder(orderNo: string) {
  try {
    const result = await pay.query({
      out_trade_no: orderNo,
    });
    return result;
  } catch (error) {
    console.error('Query WeChat Order Error:', error);
    throw new Error('查询微信支付订单失败');
  }
}
```

### 支付宝封装

```typescript
// src/services/alipay.ts
import AlipaySdk from 'alipay-sdk';

const alipay = new AlipaySdk({
  appId: process.env.ALIPAY_APPID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
});

export interface CreateAlipayQrParams {
  outTradeNo: string;
  totalAmount: number;
  subject: string;
}

export async function createAlipayQrPay(params: CreateAlipayQrParams) {
  try {
    const result = await alipay.exec('alipay.trade.precreate', {
      notify_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/alipay/notify`,
      bizContent: {
        out_trade_no: params.outTradeNo,
        total_amount: params.totalAmount.toString(),
        subject: params.subject,
      },
    });

    return {
      qr_code: result.qrCode,
      out_trade_no: result.outTradeNo,
    };
  } catch (error) {
    console.error('Alipay Error:', error);
    throw new Error('创建支付宝订单失败');
  }
}

export async function queryAlipayOrder(orderNo: string) {
  try {
    const result = await alipay.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderNo,
      },
    });
    return result;
  } catch (error) {
    console.error('Query Alipay Order Error:', error);
    throw new Error('查询支付宝订单失败');
  }
}
```

### 第四步：创建支付 API 接口

```typescript
// src/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createWechatNativePay } from '@/services/wechatPay';
import { createAlipayQrPay } from '@/services/alipay';
import QRCode from 'qrcode';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentMethod, amount, description, type } = body;

    // 生成订单号
    const orderNo = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let qrCodeUrl = '';
    let orderId = '';

    if (paymentMethod === 'wechat') {
      // 微信支付（单位：分）
      const result = await createWechatNativePay({
        description,
        out_trade_no: orderNo,
        amount: Math.round(amount * 100),
      });
      qrCodeUrl = result.code_url;
      orderId = result.prepay_id;

    } else if (paymentMethod === 'alipay') {
      // 支付宝（单位：元）
      const result = await createAlipayQrPay({
        outTradeNo: orderNo,
        totalAmount: amount,
        subject: description,
      });
      qrCodeUrl = result.qr_code;
      orderId = result.out_trade_no;
    }

    // 生成二维码图片（Base64）
    const qrCodeImage = await QRCode.toDataURL(qrCodeUrl);

    // 保存订单到数据库
    // await saveOrder({ orderNo, amount, paymentMethod, type, status: 'pending' });

    return NextResponse.json({
      success: true,
      orderNo,
      orderId,
      qrCodeImage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 第五步：修改前端对话框，调用支付 API

在 `RechargeDialog.tsx` 中：

```typescript
const [qrCodeImage, setQrCodeImage] = useState<string>('');

// 选择金额或套餐后，生成支付二维码
useEffect(() => {
  const generatePaymentQr = async () => {
    if ((activeTab === 'balance' && selectedAmount > 0) ||
        (activeTab === 'member' && selectedPlan) ||
        (activeTab === 'points' && selectedPoints > 0)) {

      let amount = 0;
      let description = '';

      if (activeTab === 'balance') {
        amount = selectedAmount;
        description = `充值 ¥${selectedAmount}`;
      } else if (activeTab === 'member') {
        const plan = MEMBERSHIP_PLANS.find(p => p.id === selectedPlan);
        amount = plan?.price || 0;
        description = `${plan?.name} - ${plan?.period}`;
      } else if (activeTab === 'points') {
        const pkg = POINTS_PACKAGES.find(p => p.points === selectedPoints);
        amount = pkg?.price || 0;
        description = `${pkg?.points.toLocaleString()} 积分`;
      }

      try {
        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentMethod,
            amount,
            description,
            type: activeTab,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setQrCodeImage(data.qrCodeImage);
        }
      } catch (error) {
        console.error('Generate QR Code Error:', error);
      }
    }
  };

  generatePaymentQr();
}, [selectedAmount, selectedPlan, selectedPoints, paymentMethod, activeTab]);
```

### 第六步：轮询支付状态

```typescript
// src/app/api/payment/query/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { queryWechatOrder } from '@/services/wechatPay';
import { queryAlipayOrder } from '@/services/alipay';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNo = searchParams.get('orderNo');
    const paymentMethod = searchParams.get('paymentMethod');

    if (!orderNo || !paymentMethod) {
      return NextResponse.json(
        { success: false, error: '参数缺失' },
        { status: 400 }
      );
    }

    let result;

    if (paymentMethod === 'wechat') {
      result = await queryWechatOrder(orderNo);
    } else if (paymentMethod === 'alipay') {
      result = await queryAlipayOrder(orderNo);
    }

    const isPaid = result?.trade_state === 'SUCCESS' || result?.tradeStatus === 'TRADE_SUCCESS';

    return NextResponse.json({
      success: true,
      isPaid,
      status: result?.trade_state || result?.tradeStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 第七步：前端轮询支付状态

```typescript
const [isPolling, setIsPolling] = useState(false);
const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

// 轮询支付状态
useEffect(() => {
  if (!qrCodeImage || isPolling) return;

  const pollPaymentStatus = async () => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 60; // 最多轮询60次（5分钟）

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(
          `/api/payment/query?orderNo=${orderNo}&paymentMethod=${paymentMethod}`,
          { credentials: 'include' }
        );

        const data = await response.json();

        if (data.success && data.isPaid) {
          setPaymentStatus('success');
          clearInterval(interval);
          setIsPolling(false);

          // 支付成功，刷新余额或会员信息
          await fetchMemberInfo();
          await refreshUser();

          setTimeout(() => {
            onClose();
          }, 2000);
        } else if (attempts >= maxAttempts) {
          setPaymentStatus('failed');
          clearInterval(interval);
          setIsPolling(false);
        }
      } catch (error) {
        console.error('Poll Payment Status Error:', error);
      }
    }, 5000); // 每5秒查询一次
  };

  pollPaymentStatus();
}, [qrCodeImage]);
```

### 第八步：配置支付回调通知

```typescript
// src/app/api/payment/wechat/notify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import WxPay from 'wechatpay-node-v3';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('wechatpay-signature');
    const timestamp = request.headers.get('wechatpay-timestamp');
    const nonce = request.headers.get('wechatpay-nonce');
    const serial = request.headers.get('wechatpay-serial');

    // 验证签名
    // const isValid = await verifyWechatPaySignature({ body, signature, timestamp, nonce, serial });

    // 解析回调数据
    const data = JSON.parse(body);
    const outTradeNo = data.resource.ciphertext;

    // 更新订单状态
    // await updateOrderStatus(outTradeNo, 'success');

    return NextResponse.json({ code: 'SUCCESS', message: '成功' });
  } catch (error) {
    return NextResponse.json({ code: 'FAIL', message: '失败' }, { status: 500 });
  }
}
```

## 测试流程

1. 使用微信支付沙箱环境测试
2. 使用支付宝沙箱环境测试
3. 生产环境部署前，确保配置正确的生产环境证书和密钥

## 注意事项

1. 金额单位：
   - 微信支付：分
   - 支付宝：元

2. 回调地址必须是 HTTPS

3. 证书文件需要安全存储，不要提交到代码仓库

4. 订单号需要唯一，建议格式：`{类型}_{时间戳}_{随机数}`

5. 支付状态轮询建议：
   - 间隔：5秒
   - 最大次数：60次（5分钟）
   - 超时后提示用户手动刷新

## 简化方案（推荐）

如果你没有真实的商户号，可以：
1. 使用测试环境的固定二维码（模拟支付）
2. 提供手动确认功能（管理员后台审核）
3. 使用第三方聚合支付服务（如易宝、连连支付等）
