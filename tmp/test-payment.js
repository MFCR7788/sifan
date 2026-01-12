/**
 * 微信支付接口测试脚本
 * 用途：在生产环境服务器上测试支付接口是否能正常返回 code_url
 * 使用方法：node tmp/test-payment.js
 */

const http = require('http');
const https = require('https');

// 配置
const BASE_URL = 'http://localhost:5000';
const TEST_USER_ID = 'test_user_' + Date.now(); // 模拟用户ID

// 测试数据
const testData = {
  paymentMethod: 'wechat',
  amount: 0.01, // 0.01 元
  description: '测试支付',
  type: 'recharge',
  metadata: {
    test: true
  }
};

/**
 * 发送 HTTP 请求
 */
function sendRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: response });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * 测试支付接口
 */
async function testPayment() {
  console.log('========================================');
  console.log('  微信支付接口测试');
  console.log('========================================\n');

  console.log('测试配置：');
  console.log(`  API 地址: ${BASE_URL}/api/payment/create`);
  console.log(`  测试用户ID: ${TEST_USER_ID}`);
  console.log(`  充值金额: ¥${testData.amount}`);
  console.log(`  支付方式: ${testData.paymentMethod}`);
  console.log('');

  console.log('请求数据：');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    console.log('发送请求...\n');

    const response = await sendRequest(
      `${BASE_URL}/api/payment/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': TEST_USER_ID // 通过 Header 传递 userId（模拟登录）
        }
      },
      testData
    );

    console.log('========================================');
    console.log('  响应结果');
    console.log('========================================\n');

    console.log('HTTP 状态码:', response.status);
    console.log('');

    console.log('响应数据：');
    console.log(JSON.stringify(response.body, null, 2));
    console.log('');

    // 分析结果
    console.log('========================================');
    console.log('  结果分析');
    console.log('========================================\n');

    if (response.body.success) {
      console.log('✅ 支付接口调用成功！\n');
      console.log('订单号:', response.body.orderNo);
      console.log('交易ID:', response.body.transactionId);
      console.log('金额:', '¥' + response.body.amount);
      console.log('');

      if (response.body.qrCodeImage) {
        console.log('✅ 二维码图片生成成功！');
        console.log('二维码图片长度:', response.body.qrCodeImage.length, '字节');
        console.log('二维码图片前缀:', response.body.qrCodeImage.substring(0, 50) + '...');
      } else {
        console.log('⚠️ 二维码图片未生成');
      }

      console.log('\n🎉 测试通过！支付功能正常工作。');
    } else {
      console.log('❌ 支付接口调用失败！\n');
      console.log('错误信息:', response.body.error);
      if (response.body.details) {
        console.log('详细说明:', response.body.details);
      }

      // 检查常见的错误类型
      console.log('\n错误分析：');
      if (response.body.error?.includes('未登录')) {
        console.log('  - 可能原因：认证失败');
      } else if (response.body.error?.includes('微信支付配置错误')) {
        console.log('  - 可能原因：SDK 未初始化或证书配置错误');
      } else if (response.body.error?.includes('code_url')) {
        console.log('  - 可能原因：微信支付 API 返回数据异常');
      } else if (response.body.error?.includes('NO_AUTH')) {
        console.log('  - 可能原因：微信商户账号权限问题');
      }
    }
  } catch (error) {
    console.log('❌ 请求失败！\n');
    console.log('错误信息:', error.message);
    console.log('\n可能原因：');
    console.log('  - 服务器未启动（5000端口）');
    console.log('  - 网络连接问题');
    console.log('  - API 路由不存在');
  }

  console.log('\n========================================\n');
}

// 运行测试
testPayment().catch(console.error);
