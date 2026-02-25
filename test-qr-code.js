const QRCode = require('qrcode');

// 测试二维码生成
async function testQrCodeGeneration() {
  try {
    console.log('开始测试二维码生成...');
    
    // 测试用的支付链接
    const testUrl = 'https://pay.weixin.qq.com/mock/test-payment';
    
    console.log('生成二维码中...');
    const qrCodeImage = await QRCode.toDataURL(testUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    
    console.log('✅ 二维码生成成功！');
    console.log('二维码数据长度:', qrCodeImage.length);
    console.log('前100个字符:', qrCodeImage.substring(0, 100) + '...');
    
  } catch (error) {
    console.error('❌ 二维码生成失败:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testQrCodeGeneration();