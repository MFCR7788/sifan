/**
 * 微信支付接口测试脚本 V2
 * 功能：
 * 1. 注册测试用户（如果不存在）
 * 2. 登录获取 Cookie
 * 3. 测试支付接口
 */

const http = require('http');

// 配置
const BASE_URL = 'http://localhost:5000';

// 测试用户信息
const testUser = {
  name: '测试用户',
  email: `test_${Date.now()}@example.com`,
  phone: `138${Math.floor(Math.random() * 100000000)}`,
  password: 'test123456'
};

let authToken = null;
let userId = null;

/**
 * 发送 HTTP 请求
 */
function sendRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
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
 * 步骤 1: 注册测试用户
 */
async function registerUser() {
  console.log('========================================');
  console.log('  步骤 1: 注册测试用户');
  console.log('========================================\n');

  console.log('用户信息：');
  console.log(`  姓名: ${testUser.name}`);
  console.log(`  邮箱: ${testUser.email}`);
  console.log(`  手机: ${testUser.phone}`);
  console.log(`  密码: ${testUser.password}`);
  console.log('');

  try {
    const response = await sendRequest(
      `${BASE_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      testUser
    );

    if (response.body.success) {
      userId = response.body.user.id;
      console.log('✅ 用户注册成功！');
      console.log(`  用户ID: ${userId}`);
      console.log('');
      return true;
    } else {
      console.log('⚠️ 用户注册失败（可能邮箱/手机已存在），尝试登录...\n');
      return false;
    }
  } catch (error) {
    console.log('❌ 注册请求失败：', error.message);
    console.log('');
    return false;
  }
}

/**
 * 步骤 2: 登录获取 Token
 */
async function loginUser() {
  console.log('========================================');
  console.log('  步骤 2: 登录');
  console.log('========================================\n');

  try {
    const response = await sendRequest(
      `${BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        email: testUser.email,
        phone: testUser.phone,
        password: testUser.password
      }
    );

    if (response.body.success) {
      userId = response.body.user.id;
      authToken = response.headers['set-cookie']?.[0];
      console.log('✅ 登录成功！');
      console.log(`  用户ID: ${userId}`);
      console.log('');

      return true;
    } else {
      console.log('❌ 登录失败！');
      console.log(`  错误: ${response.body.error}`);
      console.log('');
      return false;
    }
  } catch (error) {
    console.log('❌ 登录请求失败：', error.message);
    console.log('');
    return false;
  }
}

/**
 * 步骤 3: 测试支付接口
 */
async function testPayment() {
  console.log('========================================');
  console.log('  步骤 3: 测试支付接口');
  console.log('========================================\n');

  console.log('测试配置：');
  console.log(`  API 地址: ${BASE_URL}/api/payment/create`);
  console.log(`  用户ID: ${userId}`);
  console.log(`  充值金额: ¥0.01`);
  console.log(`  支付方式: wechat`);
  console.log('');

  const testData = {
    paymentMethod: 'wechat',
    amount: 0.01,
    description: '测试支付',
    type: 'recharge',
    metadata: { test: true }
  };

  console.log('请求数据：');
  console.log(JSON.stringify(testData, null, 2));
  console.log('');

  try {
    const response = await sendRequest(
      `${BASE_URL}/api/payment/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
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
      } else {
        console.log('⚠️ 二维码图片未生成');
      }

      console.log('\n🎉 测试通过！支付功能正常工作。');
      return true;
    } else {
      console.log('❌ 支付接口调用失败！\n');
      console.log('错误信息:', response.body.error);
      if (response.body.details) {
        console.log('详细说明:', response.body.details);
      }

      console.log('\n错误分析：');
      if (response.body.error?.includes('未登录')) {
        console.log('  - 可能原因：认证失败');
      } else if (response.body.error?.includes('微信支付配置错误')) {
        console.log('  - 可能原因：SDK 未初始化或证书配置错误');
      } else if (response.body.error?.includes('code_url')) {
        console.log('  - 可能原因：微信支付 API 返回数据异常');
      } else if (response.body.error?.includes('NO_AUTH')) {
        console.log('  - 可能原因：微信商户账号权限问题');
      } else if (response.body.details?.includes('Failed query')) {
        console.log('  - 可能原因：数据库插入失败（外键约束等）');
      }

      return false;
    }
  } catch (error) {
    console.log('❌ 请求失败！\n');
    console.log('错误信息:', error.message);
    console.log('\n可能原因：');
    console.log('  - 服务器未启动（5000端口）');
    console.log('  - 网络连接问题');
    console.log('  - API 路由不存在');
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('\n');
  console.log('========================================');
  console.log('  微信支付接口测试 V2');
  console.log('========================================\n');

  // 步骤 1: 注册用户
  const registered = await registerUser();

  // 步骤 2: 登录（无论注册是否成功，都尝试登录）
  const loggedIn = await loginUser();

  if (!loggedIn) {
    console.log('❌ 无法登录，测试终止。\n');
    process.exit(1);
  }

  // 步骤 3: 测试支付
  const paymentSuccess = await testPayment();

  console.log('\n========================================\n');

  process.exit(paymentSuccess ? 0 : 1);
}

// 运行测试
main().catch(console.error);
