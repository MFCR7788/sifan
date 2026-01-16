import { NextResponse } from 'next/server';

export async function GET() {
  // 检查关键环境变量是否配置
  const envChecks = {
    COZE_WORKLOAD_IDENTITY_API_KEY: {
      exists: !!process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
      prefix: process.env.COZE_WORKLOAD_IDENTITY_API_KEY?.substring(0, 7) + '...',
      length: process.env.COZE_WORKLOAD_IDENTITY_API_KEY?.length || 0,
    },
    NODE_ENV: process.env.NODE_ENV,
    BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  };

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    checks: envChecks,
  });
}
