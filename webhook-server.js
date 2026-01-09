const http = require('http');
const { exec } = require('child_process');
const crypto = require('crypto');

// 配置
const PORT = 3001;
const SECRET = process.env.WEBHOOK_SECRET || 'your-secret-key-here'; // 设置你的Webhook密钥

console.log(`Webhook服务器启动在端口 ${PORT}...`);

const server = http.createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                // 验证GitHub签名（如果配置了SECRET）
                const signature = req.headers['x-hub-signature-256'];
                if (SECRET && signature) {
                    const expectedSignature = 'sha256=' +
                        crypto.createHmac('sha256', SECRET)
                            .update(body)
                            .digest('hex');

                    if (signature !== expectedSignature) {
                        console.log('❌ 签名验证失败');
                        res.writeHead(403);
                        res.end('Invalid signature');
                        return;
                    }
                }

                const payload = JSON.parse(body);

                // 检查是否是push事件
                if (payload.ref === 'refs/heads/main') {
                    console.log(`\n📥 收到推送事件: ${payload.repository.name}`);
                    console.log(`提交者: ${payload.pusher.name}`);
                    console.log(`提交信息: ${payload.head_commit.message}`);
                    console.log(`提交ID: ${payload.head_commit.id.substring(0, 7)}\n`);

                    // 执行部署脚本
                    exec('bash /root/sifan/auto-deploy.sh', (error, stdout, stderr) => {
                        if (error) {
                            console.error(`部署错误: ${error}`);
                            res.writeHead(500);
                            res.end('Deployment failed');
                            return;
                        }

                        console.log('✅ 部署成功');
                        res.writeHead(200);
                        res.end('Deployment successful');
                    });
                } else {
                    console.log(`忽略非main分支推送: ${payload.ref}`);
                    res.writeHead(200);
                    res.end('Ignored - not main branch');
                }

            } catch (err) {
                console.error('处理Webhook错误:', err);
                res.writeHead(500);
                res.end('Server error');
            }
        });
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200);
        res.end('OK');
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`Webhook服务器正在监听: http://0.0.0.0:${PORT}`);
    console.log(`Webhook URL: http://42.121.218.14:${PORT}/webhook`);
});
