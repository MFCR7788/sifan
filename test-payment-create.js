const { createPaymentOrder } = require('./src/storage/database/paymentOrderManager');

// 测试创建支付订单
async function testCreatePaymentOrder() {
  try {
    console.log('开始测试创建支付订单...');
    
    const order = await createPaymentOrder({
      userId: 'test-user-123',
      orderType: 'recharge',
      amount: 10000, // 100元
      paymentMethod: 'wechat',
      description: '测试充值',
      metadata: {
        originalAmount: 100,
        bonusAmount: 0,
      },
    });
    
    console.log('✅ 订单创建成功！');
    console.log('订单信息:', order);
    console.log('订单号:', order.orderNo);
    console.log('订单ID:', order.id);
    
  } catch (error) {
    console.error('❌ 订单创建失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testCreatePaymentOrder();