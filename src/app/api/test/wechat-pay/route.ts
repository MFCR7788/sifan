import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const results: any = {
    wechat_pay_config: {},
    cert_files: {},
    sdk_status: 'unknown',
  };

  // 环境变量检查
  results.wechat_pay_config = {
    appid: process.env.WECHAT_PAY_APPID ? '已配置' : '未配置',
    mchid: process.env.WECHAT_PAY_MCHID ? '已配置' : '未配置',
    api_v3_key: process.env.WECHAT_PAY_API_V3_KEY ? '已配置' : '未配置',
    serial_no: process.env.WECHAT_PAY_SERIAL_NO ? '已配置' : '未配置',
    private_key_path: process.env.WECHAT_PAY_PRIVATE_KEY_PATH || '未配置',
    cert_path: process.env.WECHAT_PAY_CERT_PATH || '未配置',
  };

  // 证书文件检查
  const privateKeyPath = process.env.WECHAT_PAY_PRIVATE_KEY_PATH;
  const certPath = process.env.WECHAT_PAY_CERT_PATH;

  results.cert_files = {
    private_key_exists: privateKeyPath ? fs.existsSync(privateKeyPath) : false,
    cert_exists: certPath ? fs.existsSync(certPath) : false,
  };

  if (privateKeyPath && fs.existsSync(privateKeyPath)) {
    try {
      const privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
      results.cert_files.private_key_size = privateKey.length;
      results.cert_files.private_key_preview = privateKey.substring(0, 50) + '...';
    } catch (error: any) {
      results.cert_files.private_key_error = error.message;
    }
  }

  if (certPath && fs.existsSync(certPath)) {
    try {
      const cert = fs.readFileSync(certPath, 'utf-8');
      results.cert_files.cert_size = cert.length;
      results.cert_files.cert_preview = cert.substring(0, 50) + '...';
    } catch (error: any) {
      results.cert_files.cert_error = error.message;
    }
  }

  // 尝试初始化 SDK
  try {
    const WxPay = (await import('wechatpay-node-v3')).default;

    const privateKeyContent = privateKeyPath && fs.existsSync(privateKeyPath)
      ? fs.readFileSync(privateKeyPath)
      : Buffer.from('');

    const certContent = certPath && fs.existsSync(certPath)
      ? fs.readFileSync(certPath)
      : Buffer.from('');

    const config: any = {
      appid: process.env.WECHAT_PAY_APPID || '',
      mchid: process.env.WECHAT_PAY_MCHID || '',
      privateKey: privateKeyContent,
    };

    if (process.env.WECHAT_PAY_SERIAL_NO) {
      config.serial_no = process.env.WECHAT_PAY_SERIAL_NO;
    }

    if (certContent.length > 0) {
      config.publicKey = certContent;
    }

    const pay = new WxPay(config);
    results.sdk_status = '初始化成功';
    results.sdk_config = {
      appid: config.appid,
      mchid: config.mchid,
      hasPrivateKey: !!config.privateKey,
      hasPublicKey: !!config.publicKey,
      hasSerialNo: !!config.serial_no,
    };

    // 尝试测试调用（可能会失败，但可以看错误信息）
    try {
      // 这里不实际调用，只是测试 SDK 是否可用
    } catch (error: any) {
      results.sdk_test_error = error.message;
    }
  } catch (error: any) {
    results.sdk_status = '初始化失败';
    results.sdk_error = error.message;
    results.sdk_stack = error.stack;
  }

  return NextResponse.json(results);
}
