import { NextRequest, NextResponse } from 'next/server';

// 仅允许开发环境使用，生产环境会自动禁用
if (process.env.NODE_ENV === 'production') {
  return NextResponse.json(
    { error: '此接口仅限开发环境使用' },
    { status: 403 }
  );
}

export async function GET(request: NextRequest) {
  const config = {
    // 非敏感配置
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    APP_NAME: process.env.APP_NAME,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,

    // 敏感配置（脱敏）
    COZE_WORKLOAD_IDENTITY_API_KEY: process.env.COZE_WORKLOAD_IDENTITY_API_KEY ? '已配置' : '未配置',
    DATABASE_URL: process.env.DATABASE_URL ? '已配置' : '未配置',
    PGDATABASE_URL: process.env.PGDATABASE_URL ? '已配置' : '未配置',
    WECHAT_PAY_APPID: process.env.WECHAT_PAY_APPID ? process.env.WECHAT_PAY_APPID : '未配置',
    WECHAT_PAY_MCHID: process.env.WECHAT_PAY_MCHID ? process.env.WECHAT_PAY_MCHID : '未配置',
    JWT_SECRET: process.env.JWT_SECRET ? '已配置' : '未配置',

    // 对象存储配置
    COZE_BUCKET_ENDPOINT_URL: process.env.COZE_BUCKET_ENDPOINT_URL || '未配置',
    COZE_BUCKET_NAME: process.env.COZE_BUCKET_NAME || '未配置',
  };

  return NextResponse.json(config);
}
