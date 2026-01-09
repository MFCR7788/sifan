module.exports = {
  apps: [{
    name: 'webhook-server',
    script: 'webhook-server.js',
    cwd: '/root/sifan',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '200M',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      WEBHOOK_SECRET: 'sifan-webhook-secret-2026' // 可以修改为你的密钥
    },
    error_file: './logs/webhook-error.log',
    out_file: './logs/webhook-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000
  }]
};
