# 🚀 Quick Start Guide

## 一分钟快速启动

### 1. 克隆并安装
```bash
git clone https://github.com/TrainingJace/StockTradingSimulator.git
cd StockTradingSimulator
npm run install:all
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
- **前端**: http://localhost:5173
- **后端API**: http://localhost:3001/api

就这么简单！🎉

---

## 📋 系统要求

- **Node.js**: >= 16.0.0
- **npm**: >= 8.0.0
- **操作系统**: Windows, macOS, Linux

---

## 🎯 项目概览

这是一个**股票交易模拟器**，包含：

- 📊 **实时股价查询**（模拟数据）
- 💼 **投资组合管理**
- 📈 **交易执行**（买入/卖出）
- 📰 **交易历史记录**
- 👤 **用户管理**

---

## 🔍 API 快速测试

### 健康检查
```bash
curl http://localhost:3001/api/health
```

### 获取股票价格
```bash
curl http://localhost:3001/api/stocks/AAPL
```

### 创建用户
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "trader1", "email": "trader1@example.com"}'
```

### 执行交易
```bash
curl -X POST http://localhost:3001/api/portfolio/user/1/trade \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "shares": 10,
    "price": 175.25,
    "type": "BUY"
  }'
```

---

## ⚙️ 环境配置

### 开发模式（默认）
```env
# server/.env
MODE=test
PORT=3001
```
- ✅ 使用 Mock 数据
- ✅ 快速启动
- ✅ 无需外部依赖

### 生产模式
```env
# server/.env
MODE=prod
STOCK_API_KEY=your_api_key
DB_HOST=your_database_host
```
- 🔗 连接真实数据库
- 🌐 调用外部 API
- 📊 真实股票数据

---

## 🛠️ 可用命令

### 根目录命令
```bash
npm run dev           # 同时启动前后端
npm run start         # 生产模式启动
npm run install:all   # 安装所有依赖
```

### 服务器命令
```bash
npm run server:dev    # 启动后端开发服务器
npm run server:start  # 启动后端生产服务器
```

### 客户端命令
```bash
npm run client:dev     # 启动前端开发服务器
npm run client:build   # 构建前端生产版本
npm run client:preview # 预览构建结果
```

---

## 📁 项目结构速览

```
StockTradingSimulator/
├── client/                    # React 前端
│   ├── src/
│   │   ├── api/              # API 调用
│   │   ├── hooks/            # 自定义 Hooks
│   │   ├── components/       # 通用组件
│   │   └── pages/            # 页面组件
│   └── package.json
├── server/                    # Express 后端
│   ├── routes/               # API 路由
│   ├── controllers/          # 控制器
│   ├── services/             # 业务逻辑
│   ├── models/               # 数据模型
│   ├── utils/                # 工具函数
│   ├── config/               # 配置文件
│   └── .env                  # 环境变量
├── _document/                 # 项目文档
└── package.json              # 根配置
```

---

## 🔄 服务切换机制

### 自动加载
所有服务都有两个版本：
- `xxxService.mock.js` - 模拟数据
- `xxxService.real.js` - 真实数据

根据 `MODE` 环境变量自动选择：

```javascript
// 在任何地方使用
const services = require('./services');
services.userService.getUserById(1);     // 自动选择 mock 或 real
services.stockService.getStockPrice('AAPL');
```

---

## 🧪 快速测试流程

### 1. 创建用户并获取 ID
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "email": "test@example.com"}'
# 返回: {"success": true, "data": {"id": 1, ...}}
```

### 2. 创建投资组合
```bash
curl -X POST http://localhost:3001/api/portfolio/user/1 \
  -d '{"initialBalance": 10000}'
```

### 3. 查看可用股票
```bash
curl "http://localhost:3001/api/stocks/search?q=apple"
```

### 4. 执行买入交易
```bash
curl -X POST http://localhost:3001/api/portfolio/user/1/trade \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "shares": 5,
    "price": 175.25,
    "type": "BUY"
  }'
```

### 5. 查看投资组合
```bash
curl http://localhost:3001/api/portfolio/user/1
```

### 6. 查看交易历史
```bash
curl http://localhost:3001/api/portfolio/user/1/transactions
```

---

## 🌟 Mock 数据预览

### 预设用户
| ID | Username | Email | Balance |
|----|----------|-------|---------|
| 1 | john_doe | john@example.com | $10,000 |
| 2 | jane_smith | jane@example.com | $15,000 |

### 预设股票
| Symbol | Name | Price | Change |
|--------|------|-------|--------|
| AAPL | Apple Inc. | $175.25 | +$2.50 |
| GOOGL | Alphabet Inc. | $145.80 | -$1.20 |
| MSFT | Microsoft Corp. | $415.50 | +$5.75 |

---

## 🐛 常见问题

### Q: `vite: command not found`
```bash
# 解决方案
cd client
npm install
```

### Q: 端口被占用
```bash
# 修改端口
# 编辑 server/.env
PORT=3002
```

### Q: 跨域错误
确保后端已启动且配置了 CORS（已默认配置）

### Q: 服务加载失败
检查文件命名是否正确：
- ✅ `userService.mock.js`
- ❌ `userService-mock.js`

---

## 📚 更多资源

- 📖 **完整 API 文档**: [`_document/API-Documentation.md`](./API-Documentation.md)
- 🛠️ **开发指南**: [`_document/Development-Guide.md`](./Development-Guide.md)
- 🎯 **GitHub 仓库**: https://github.com/TrainingJace/StockTradingSimulator

---

## 🎉 完成！

现在您可以：
1. ✅ 启动应用 (`npm run dev`)
2. ✅ 测试 API 端点
3. ✅ 开始开发新功能
4. ✅ 切换 Mock/Real 数据模式

Happy Coding! 🚀
