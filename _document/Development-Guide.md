# Stock Trading Simulator 开发指南

## 📁 项目架构概述

### 整体架构
```
StockTradingSimulator/
├── client/                 # React 前端应用
├── server/                 # Express 后端 API
├── _document/              # 项目文档
└── package.json            # 根目录配置（并发运行脚本）
```

### 技术栈
- **前端**: React 18 + Vite + ES6 Modules
- **后端**: Node.js + Express 5
- **开发工具**: Concurrently (并发运行)
- **数据**: Mock 数据 + 真实 API 切换

---

## 🎯 核心设计模式

### 1. 动态服务加载模式

#### 服务文件命名规范
```
services/
├── index.js                # 自动加载器
├── userService.mock.js     # Mock 实现
├── userService.real.js     # 真实实现
├── stockService.mock.js
├── stockService.real.js
├── portfolioService.mock.js
└── portfolioService.real.js
```

#### 自动加载机制
```javascript
// services/index.js
const MODE = process.env.MODE || 'test';
const isTestMode = MODE === 'test';

function loadServices() {
  const services = {};
  const suffix = isTestMode ? '.mock.js' : '.real.js';
  
  // 自动扫描并加载对应模式的服务
  serviceFiles.forEach(file => {
    const serviceName = file.replace(suffix, '');
    services[serviceName] = require(path.join(__dirname, file));
  });
  
  return services;
}
```

#### 使用方式
```javascript
// 在任何 controller 或其他文件中
const services = require('../services');

// 自动使用正确的实现（mock 或 real）
const user = await services.userService.getUserById(1);
const stock = await services.stockService.getStockPrice('AAPL');
```

### 2. MVC 架构模式

#### Controller 层职责
- 处理 HTTP 请求参数
- 调用 Service 层方法
- 返回标准化响应
- 错误处理

```javascript
// controllers/userController.js
class UserController {
  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await services.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
```

#### Service 层职责
- 业务逻辑处理
- 数据验证
- 外部 API 调用
- 数据转换

```javascript
// services/userService.mock.js
class UserService {
  async getUserById(userId) {
    console.log(`[MOCK] Getting user by ID: ${userId}`);
    const user = mockUsers.find(u => u.id === parseInt(userId));
    return user || null;
  }
}
```

#### Model 层职责
- 数据结构定义
- 数据验证方法
- 数据格式化

```javascript
// models/User.js
class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.balance = data.balance || 10000;
  }

  static validate(userData) {
    const errors = [];
    if (!userData.username) errors.push('Username is required');
    return { isValid: errors.length === 0, errors };
  }
}
```

---

## 🚀 开发环境搭建

### 1. 项目初始化
```bash
# 克隆项目
git clone https://github.com/TrainingJace/StockTradingSimulator.git
cd StockTradingSimulator

# 安装所有依赖
npm run install:all
```

### 2. 环境配置
```bash
# 复制环境变量文件
cp server/.env.example server/.env

# 编辑环境变量
nano server/.env
```

```env
# 开发模式配置
MODE=test
PORT=3001

# 生产模式配置（暂时注释）
# MODE=prod
# STOCK_API_KEY=your_api_key
# DB_HOST=localhost
```

### 3. 启动开发服务器
```bash
# 同时启动前后端
npm run dev

# 或者分别启动
npm run server:dev  # 后端: http://localhost:3001
npm run client:dev  # 前端: http://localhost:5173
```

---

## 🔧 添加新功能

### 1. 添加新的服务模块

#### Step 1: 创建 Mock 实现
```javascript
// services/newsService.mock.js
const mockNews = [
  {
    id: 1,
    title: "Apple Stock Rises",
    content: "Apple stock continues to climb...",
    symbol: "AAPL",
    publishedAt: "2024-01-01T10:00:00.000Z"
  }
];

class NewsService {
  async getNewsBySymbol(symbol) {
    console.log(`[MOCK] Getting news for: ${symbol}`);
    return mockNews.filter(news => news.symbol === symbol);
  }
}

module.exports = new NewsService();
```

#### Step 2: 创建 Real 实现
```javascript
// services/newsService.real.js
class NewsService {
  async getNewsBySymbol(symbol) {
    console.log(`[REAL] Getting news for: ${symbol}`);
    try {
      // 调用外部新闻 API
      const response = await fetch(`https://newsapi.org/v2/everything?q=${symbol}`);
      const data = await response.json();
      return data.articles;
    } catch (error) {
      throw new Error('Failed to fetch news');
    }
  }
}

module.exports = new NewsService();
```

#### Step 3: 自动加载
服务会被 `services/index.js` 自动加载，无需手动注册。

### 2. 添加新的 Controller

```javascript
// controllers/newsController.js
const services = require('../services');

class NewsController {
  async getNewsBySymbol(req, res) {
    try {
      const { symbol } = req.params;
      const news = await services.newsService.getNewsBySymbol(symbol);
      res.json({ success: true, data: news });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new NewsController();
```

### 3. 添加新的路由

```javascript
// routes/news.js
const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/symbol/:symbol', newsController.getNewsBySymbol);

module.exports = router;
```

```javascript
// routes/index.js - 注册新路由
const newsRouter = require('./news');
router.use('/news', newsRouter);
```

### 4. 添加前端 API 调用

```javascript
// client/src/api/newsApi.js
import apiClient from './client.js';

export const newsApi = {
  async getNewsBySymbol(symbol) {
    const response = await apiClient.get(`/news/symbol/${symbol}`);
    return response.data;
  }
};
```

### 5. 添加前端 Hook

```javascript
// client/src/hooks/useNews.js
import { useState, useEffect } from 'react';
import { newsApi } from '../api';

export function useNews(symbol) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!symbol) return;

    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        const newsData = await newsApi.getNewsBySymbol(symbol);
        setNews(newsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  return { news, loading, error };
}
```

---

## 🧪 测试策略

### 1. API 测试

#### 使用 curl 测试
```bash
# 测试新的新闻接口
curl http://localhost:3001/api/news/symbol/AAPL

# 测试用户创建
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'
```

#### 使用 Postman 集合
可以创建 Postman 集合来测试所有 API 端点。

### 2. Mock 数据测试
在 `MODE=test` 模式下，所有数据都是预定义的 mock 数据，便于：
- 快速开发
- 一致的测试结果
- 离线开发

### 3. 生产数据测试
切换到 `MODE=prod` 后，测试真实的外部 API 集成。

---

## 📝 代码规范

### 1. 文件命名规范
- **Service**: `xxxService.mock.js` / `xxxService.real.js`
- **Controller**: `xxxController.js`
- **Route**: `xxx.js` (复数形式，如 `users.js`)
- **Model**: `Xxx.js` (首字母大写)
- **Hook**: `useXxx.js`

### 2. API 响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": { ... }
}

// 错误响应
{
  "success": false,
  "error": "Error message"
}
```

### 3. 错误处理模式
```javascript
// Controller 中的错误处理
try {
  const result = await service.method();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error in controller:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 4. 日志规范
```javascript
// Service 中的日志
console.log(`[MOCK] Getting user by ID: ${userId}`);
console.log(`[REAL] Calling external API for: ${symbol}`);
```

---

## 🔄 环境切换

### 开发环境 (MODE=test)
```env
MODE=test
```
- 使用 Mock 数据
- 快速响应
- 无外部依赖
- 适合功能开发

### 生产环境 (MODE=prod)
```env
MODE=prod
STOCK_API_KEY=real_api_key
DB_HOST=production_db_host
```
- 使用真实数据
- 外部 API 调用
- 数据库连接
- 适合部署上线

### 切换步骤
1. 修改 `server/.env` 中的 `MODE` 值
2. 重启服务器
3. 服务自动加载对应实现

---

## 🚀 部署指南

### 1. 构建前端
```bash
npm run client:build
```

### 2. 配置生产环境变量
```env
MODE=prod
PORT=3001
STOCK_API_KEY=your_production_api_key
DB_HOST=your_database_host
```

### 3. 启动生产服务器
```bash
npm run start
```

### 4. Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🐛 常见问题解决

### 1. `vite: command not found`
```bash
# 解决方案
cd client
npm install
npm run dev
```

### 2. 服务加载失败
检查文件命名是否符合规范：
- `xxxService.mock.js`
- `xxxService.real.js`

### 3. 环境变量不生效
确保：
- `.env` 文件在 `server/` 目录下
- 重启服务器
- 检查 `require('dotenv').config()` 是否调用

### 4. 跨域问题
确保后端配置了 CORS：
```javascript
app.use(cors());
```

---

## 📚 扩展建议

### 1. 数据库集成
```javascript
// config/database.js
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

module.exports = mysql.createConnection(dbConfig);
```

### 2. 认证系统
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];
  // JWT 验证逻辑
}
```

### 3. WebSocket 实时更新
```javascript
// 股价实时推送
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  // 实时推送股价更新
});
```

### 4. 缓存层
```javascript
// utils/cache.js
const Redis = require('redis');
const client = Redis.createClient();

// 缓存股价数据
async function cacheStockPrice(symbol, data) {
  await client.setex(`stock:${symbol}`, 60, JSON.stringify(data));
}
```

---

## 📞 开发支持

### 团队联系方式
- **项目仓库**: https://github.com/TrainingJace/StockTradingSimulator
- **Issue 跟踪**: GitHub Issues
- **文档更新**: 请提交 PR 到 `_document/` 目录

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/新功能`)
3. 提交更改 (`git commit -am '添加新功能'`)
4. 推送分支 (`git push origin feature/新功能`)
5. 创建 Pull Request

---

## 📈 性能优化建议

### 1. 前端优化
- 使用 React.memo 避免不必要的重渲染
- 实现虚拟滚动处理大量数据
- 使用 useMemo 和 useCallback 优化计算

### 2. 后端优化
- 实现接口缓存
- 数据库查询优化
- API 请求去重和批处理

### 3. 网络优化
- 启用 gzip 压缩
- 实现 CDN 加速
- 使用 HTTP/2

这份开发指南涵盖了项目的核心架构、开发流程、最佳实践和扩展建议。希望能帮助团队快速上手开发！
