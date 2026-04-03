const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const gameRoutes = require('./routes/game');
const rankRoutes = require('./routes/rank');

const app = express();
const PORT = 3000;

// 中间件配置
app.use(cors());  // 允许跨域请求
app.use(bodyParser.json());  // 解析JSON请求体
app.use(bodyParser.urlencoded({ extended: true }));  // 解析URL编码请求体

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`📨 ${new Date().toLocaleString()} ${req.method} ${req.url}`);
  next();
});

// 路由配置
app.use('/api/game', gameRoutes);
app.use('/api/rank', rankRoutes);

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ 
    code: 200, 
    message: '贪吃蛇游戏后端服务正常运行',
    timestamp: new Date().toISOString()
  });
});

// 根路径
app.get('/', (req, res) => {
  res.json({
    code: 200,
    message: '欢迎使用贪吃蛇游戏后端API',
    endpoints: {
      health: 'GET /health',
      game: {
        submit: 'POST /api/game/submit',
        stats: 'GET /api/game/stats/:openid',
        history: 'GET /api/game/history/:openid'
      },
      rank: {
        list: 'GET /api/rank/list',
        userRank: 'GET /api/rank/user-rank/:openid',
        difficultyRank: 'GET /api/rank/difficulty-rank'
      }
    }
  });
});

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    path: req.originalUrl
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('❌ 服务器错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误: ' + err.message
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('🚀 贪吃蛇游戏后端服务已启动');
  console.log('📍 服务地址: http://localhost:' + PORT);
  console.log('📊 健康检查: http://localhost:' + PORT + '/health');
  console.log('⏰ 启动时间:', new Date().toLocaleString());
  console.log('=' .repeat(50));
});

module.exports = app;