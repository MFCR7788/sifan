#!/usr/bin/env node

const axios = require('axios');

// 测试微信支付回调
async function testWechatCallback() {
  console.log('=== 测试微信支付回调 ===');
  
  try {
    // 模拟微信支付回调数据
    const callbackData = {
      id: '1234567890',
      create_time: '2024-01-01T00:00:00+08:00',
      resource_type: 'encrypt-resource',
      event_type: 'TRANSACTION.SUCCESS',
      summary: '支付成功',
      resource: {
        algorithm: 'AEAD_AES_256_GCM',
        associated_data: '',
        ciphertext: 'eyJvcmdfdHJhZGVfbm8iOiJyY2hfMTc3MjAxOTg0NzA5OSIsInRyYWRlX3N0YXRlIjoiU1VDQ0VTUyIsInRyYW5zYWN0aW9uX2lkIjoiMTIzNDU2Nzg5MCJ9',
        nonce: '123456',
        original_type: 'transaction'
      }
    };

    // 发送回调请求
    const response = await axios.post('http://localhost:8080/api/payment/wechat/notify', callbackData, {
      headers: {
        'Content-Type': 'application/json',
        'wechatpay-signature': 'WECHATPAY2-SHA256-RSA2048 test-signature',
        'wechatpay-timestamp': '1772019847',
        'wechatpay-nonce': '123456',
        'wechatpay-serial': 'test-serial'
      }
    });

    console.log('微信支付回调响应:', response.data);
    console.log('微信支付回调测试完成');
  } catch (error) {
    console.error('微信支付回调测试失败:', error.message);
  }
}

// 测试支付宝回调
async function testAlipayCallback() {
  console.log('\n=== 测试支付宝回调 ===');
  
  try {
    // 模拟支付宝回调数据
    const callbackData = {
      out_trade_no: 'rch_1772019847_abcdef',
      trade_no: '2024010123456789',
      trade_status: 'TRADE_SUCCESS',
      total_amount: '0.01',
      sign: 'test-sign',
      sign_type: 'RSA2'
    };

    // 发送回调请求
    const response = await axios.post('http://localhost:8080/api/payment/alipay/notify', callbackData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('支付宝回调响应:', response.data);
    console.log('支付宝回调测试完成');
  } catch (error) {
    console.error('支付宝回调测试失败:', error.message);
  }
}

// 测试支付查询
async function testPaymentQuery() {
  console.log('\n=== 测试支付查询 ===');
  
  try {
    // 发送查询请求
    const response = await axios.get('http://localhost:8080/api/payment/query', {
      params: {
        orderNo: 'rch_1772019847_abcdef'
      }
    });

    console.log('支付查询响应:', response.data);
    console.log('支付查询测试完成');
  } catch (error) {
    console.error('支付查询测试失败:', error.message);
  }
}

// 运行所有测试
async function runAllTests() {
  await testWechatCallback();
  await testAlipayCallback();
  await testPaymentQuery();
  console.log('\n=== 所有测试完成 ===');
}

runAllTests();
