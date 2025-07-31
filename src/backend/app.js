const express = require('express');
const cors = require('cors');
const path = require('path');
//自动运行database中的news.js文件
// require('./database/news.js');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('Loading .env from:', path.resolve(__dirname, '../../.env'));
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3001;
const MODE = process.env.MODE || 'test';

// 数据库初始化
// 在test模式下，userService和portfolioService使用真实数据库，所以也需要初始化数据库
const database = require('./database/database');
database.init().catch(console.error);

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码请求体

// 静态文件服务 - 服务根目录的 HTML 文件
app.use(express.static(path.join(__dirname, '..')));

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 导入路由
const apiRoutes = require('./routes');

// 使用路由
app.use('/api', apiRoutes);

// 根路径访问股票展示页面
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.MODE === 'test' ? error.message : 'Something went wrong'
  });
});



app.listen(PORT, () => {
  console.log(`🚀 Stock Trading Simulator API running on port ${PORT}`);
  console.log(`📊 Mode: ${process.env.MODE || 'test'}`);
  console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/api`);
});
