module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      // 网站基础 URL（用于支付回调通知）
      NEXT_PUBLIC_BASE_URL: 'https://www.zjsifan.com',
      // 微信支付配置
      WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
      WECHAT_PAY_MCHID: '1624143377',
      WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
      WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
      WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
      WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',
      // 数据库配置
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      // Cookie 配置
      COOKIE_DOMAIN: '.zjsifan.com',
      COOKIE_SECURE: 'true',
      COOKIE_SAME_SITE: 'lax',
      // JWT 配置
      JWT_SECRET: 'your-jwt-secret-key-change-in-production',
      JWT_EXPIRES_IN: '7d',
      // Coze AI API 配置
      COZE_WORKLOAD_IDENTITY_API_KEY: 'sat_Gv51DAu3iNSC3eEI2oSswcflVvwpFzIbMdLKNSRrSdgktLsmgnDc6VbwmGkhuXtM'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      // 网站基础 URL（用于支付回调通知）
      NEXT_PUBLIC_BASE_URL: 'https://www.zjsifan.com',
      // 微信支付配置
      WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
      WECHAT_PAY_MCHID: '1624143377',
      WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
      WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
      WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
      WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',
      // 数据库配置
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      // Cookie 配置
      COOKIE_DOMAIN: '.zjsifan.com',
      COOKIE_SECURE: 'true',
      COOKIE_SAME_SITE: 'lax',
      // JWT 配置
      JWT_SECRET: 'your-jwt-secret-key-change-in-production',
      JWT_EXPIRES_IN: '7d',
      // Coze AI API 配置
      COZE_WORKLOAD_IDENTITY_API_KEY: 'sat_Gv51DAu3iNSC3eEI2oSswcflVvwpFzIbMdLKNSRrSdgktLsmgnDc6VbwmGkhuXtM'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    // 健康检查
    health_check_grace_period: 1000
  }]
};
