# 🏗️ Stock Trading Simulator 项目架构总结

## 📋 项目概述

**Stock Trading Simulator** 是一个基于历史数据的股票交易模拟器，采用前后端分离架构，用于教育和培训目的。用户可以从历史特定日期开始，基于真实历史数据和新闻进行虚拟股票交易，追踪投资组合表现。

---

## 🎯 技术栈

### 前端 (Frontend)
- **框架**: React 19.1.0 + Vite 7.0.4
- **路由**: React Router DOM 7.7.1
- **状态管理**: React Context (AuthContext)
- **图表组件**: Recharts 3.1.0
- **HTTP客户端**: 自定义 ApiClient (基于 fetch)
- **构建工具**: Vite + ESLint

### 后端 (Backend)
- **运行时**: Node.js
- **框架**: Express.js 4.21.2
- **数据库**: MySQL (mysql2 3.14.2)
- **认证**: JWT (jsonwebtoken 9.0.2)
- **密码加密**: bcrypt 6.0.0
- **外部API**: Finnhub + Alpha Vantage (股票数据)
- **开发工具**: Nodemon 3.0.1

### 数据库
- **类型**: MySQL/MariaDB
- **ORM**: 原生 SQL 查询
- **连接池**: mysql2 connection pool

---

## 🏛️ 系统架构

### 1. 前端架构

```
frontend/
├── src/
│   ├── App.jsx                 # 根组件，路由配置
│   ├── main.jsx                # 应用入口
│   │
│   ├── api/                    # API 层
│   │   ├── client.js           # HTTP 客户端封装
│   │   ├── authApi.js          # 认证相关API
│   │   ├── stockApi.js         # 股票数据API
│   │   ├── portfolioApi.js     # 投资组合API
│   │   ├── tradingApi.js       # 交易相关API
│   │   ├── watchlistApi.js     # 观察列表API
│   │   ├── newsApi.js          # 新闻API
│   │   └── analyticsApi.js     # 分析统计API
│   │
│   ├── components/             # 可复用组件
│   │   ├── Navigation.jsx      # 导航栏
│   │   ├── BuyStockModal.jsx   # 买入股票弹窗
│   │   ├── SellStockModal.jsx  # 卖出股票弹窗
│   │   ├── StockChart.jsx      # 股票图表组件
│   │   └── ErrorBoundary.jsx   # 错误边界组件
│   │
│   ├── contexts/               # React Context
│   │   └── AuthContext.jsx     # 用户认证状态管理
│   │
│   ├── hooks/                  # 自定义 Hooks
│   │   ├── useAsyncData.js     # 异步数据获取
│   │   ├── useForm.js          # 表单状态管理
│   │   ├── usePortfolio.js     # 投资组合状态
│   │   ├── useStock.js         # 股票数据
│   │   └── useUser.js          # 用户状态
│   │
│   ├── pages/                  # 页面组件
│   │   ├── Home/               # 首页
│   │   ├── Auth/               # 登录注册页
│   │   ├── StockDashboard/     # 股票仪表盘
│   │   ├── StockDetail/        # 股票详情页
│   │   ├── Portfolio/          # 投资组合页面
│   │   ├── Watchlist/          # 观察列表页面
│   │   └── Analytics/          # 分析统计页面
│   │
│   └── utils/                  # 工具函数
│       └── formatters.js       # 数据格式化工具
```

### 2. 后端架构

```
backend/
├── app.js                      # Express 应用入口
├── package.json                # 后端依赖配置
│
├── config/                     # 配置文件
│   └── index.js                # 统一配置管理
│
├── routes/                     # 路由层 (URL -> Controller)
│   ├── index.js                # 路由聚合器
│   ├── auth.js                 # 认证路由
│   ├── stocks.js               # 股票相关路由
│   ├── portfolio.js            # 投资组合路由
│   ├── trading.js              # 交易路由
│   ├── watchlist.js            # 观察列表路由
│   ├── news.js                 # 新闻路由
│   └── analytics.js            # 分析统计路由
│
├── controllers/                # 控制器层 (请求处理)
│   ├── authController.js       # 认证 & 用户管理
│   ├── stockController.js      # 股票数据控制器
│   ├── portfolioController.js  # 投资组合控制器
│   ├── tradingController.js    # 交易控制器
│   ├── watchlistController.js  # 观察列表控制器
│   ├── newsController.js       # 新闻控制器
│   └── analyticsController.js  # 分析统计控制器
│
├── services/                   # 服务层 (业务逻辑)
│   ├── index.js                # 服务聚合器
│   ├── authService.js          # 认证 & 用户服务
│   ├── stockService.js         # 股票数据服务
│   ├── stockHistoryService.js  # 股票历史数据服务
│   ├── portfolioService.js     # 投资组合服务
│   ├── tradingService.js       # 交易服务
│   ├── watchlistService.js     # 观察列表服务
│   ├── newsService.js          # 新闻服务
│   └── analyticsService.js     # 分析统计服务
│
├── database/                   # 数据库层
│   ├── database.js             # 数据库连接管理
│   ├── schema.sql              # 数据库表结构
│   ├── seed-data.js            # 测试数据种子
│   ├── fetch_and_save_stocks.js     # 股票数据获取
│   ├── fetch_and_save_news.js       # 新闻数据获取
│   └── migrate-transactions-to-history.js  # 数据迁移脚本
│
├── middleware/                 # 中间件
│   └── auth.js                 # JWT 认证中间件
│
└── utils/                      # 工具函数
    ├── dateTime.js             # 日期时间工具
    ├── financial.js            # 金融计算工具
    └── validation.js           # 数据验证工具
```

---

## 🗄️ 数据库设计

### 核心表结构

1. **用户系统**
   - `users` - 用户基本信息、模拟日期

2. **投资组合系统**
   - `portfolios` - 投资组合总览
   - `positions` - 当前持仓详情
   - `transactions` - 交易记录
   - `portfolio_history` - 投资组合历史快照

3. **股票数据系统**
   - `stocks` - 股票基本信息
   - `stock_real_history` - 股票历史价格数据

4. **新闻系统**
   - `news` - 新闻数据及情感分析

5. **观察列表系统**
   - `watchlists` - 用户股票观察列表

---

## 🔄 数据流架构

### 1. 请求处理流程

```
用户请求 → 前端 API 层 → 后端路由 → 控制器 → 服务层 → 数据库
                                                   ↓
                                              外部 API
                                           (Finnhub/Alpha Vantage)
```

### 2. 分层职责

- **Routes**: URL 路径映射，参数验证
- **Controllers**: HTTP 请求/响应处理，错误处理
- **Services**: 业务逻辑，数据库操作，外部API调用
- **Database**: 数据持久化，事务管理

---

## 🌐 API 设计

### RESTful API 端点

```
# 认证相关
POST   /api/auth/register         # 用户注册
POST   /api/auth/login            # 用户登录
GET    /api/auth/verify           # Token验证
GET    /api/auth/user/:userId     # 获取用户信息

# 股票相关
GET    /api/stocks/:symbol        # 获取股票信息
GET    /api/stocks/:symbol/history # 获取历史数据
GET    /api/stocks/search?q=      # 搜索股票

# 投资组合相关
GET    /api/portfolio/user/:userId           # 获取投资组合
POST   /api/portfolio/user/:userId           # 创建投资组合
GET    /api/portfolio/user/:userId/transactions # 交易历史
GET    /api/portfolio/user/:userId/stats     # 投资组合统计

# 交易相关
POST   /api/trading/buy           # 执行买入
POST   /api/trading/sell          # 执行卖出
GET    /api/trading/history       # 交易历史

# 观察列表
GET    /api/watchlist             # 获取观察列表
POST   /api/watchlist             # 添加到观察列表
DELETE /api/watchlist/:symbol     # 移除观察项目

# 新闻相关
GET    /api/news                  # 获取新闻列表
GET    /api/news/:symbol          # 获取特定股票新闻

# 分析统计
GET    /api/analytics/portfolio   # 投资组合分析
GET    /api/analytics/performance # 表现摘要
GET    /api/analytics/history     # 价值历史
GET    /api/analytics/benchmark   # 基准比较
POST   /api/analytics/daily-settle # 每日结算
```

---

## 🔐 安全机制

### 1. 认证授权
- **JWT Token**: 无状态身份验证
- **Password Hashing**: bcrypt 加密
- **Auth Middleware**: 路由级别的认证保护

### 2. 数据保护
- **参数验证**: 前后端双重验证
- **SQL注入防护**: 参数化查询
- **CORS配置**: 跨域请求控制

---

## 🎮 核心业务流程

### 1. 用户注册/登录流程
```
注册 → 密码加密 → 创建用户记录 → 自动创建投资组合 → 返回JWT Token
登录 → 验证凭据 → 生成JWT Token → 返回用户信息
```

### 2. 股票交易流程
```
选择股票 → 查看实时/历史价格 → 下单(买入/卖出) → 验证资金/持仓 
→ 创建交易记录 → 更新投资组合 → 写入历史快照
```

### 3. 数据同步流程
```
外部API → 定时获取股票数据 → 存储到数据库 → 更新用户投资组合价值 
→ 计算收益/亏损 → 生成分析报告
```

---

## 📊 扩展性设计

### 1. 模块化架构
- 前后端完全分离，独立部署
- 服务层模块化，便于功能扩展
- 数据库设计支持水平扩展

### 2. 性能优化
- **连接池**: 数据库连接复用
- **缓存策略**: 股票数据缓存
- **分页查询**: 大数据量处理
- **异步处理**: 外部API调用

### 3. 监控与日志
- **请求日志**: 所有API请求记录
- **错误处理**: 统一错误响应格式
- **健康检查**: `/api/health` 端点

---

## 🚀 部署架构

### 开发环境
```
Frontend (Vite Dev Server) :5173
Backend (Express + Nodemon) :3001
Database (MySQL) :3306
```

### 生产环境
```
Frontend (Build + Static Server)
Backend (PM2 + Express)
Database (MySQL Cluster)
Reverse Proxy (Nginx)
```

---

## 📈 技术特点

1. **历史数据模拟**: 基于真实历史股票数据进行模拟交易
2. **实时计算**: 投资组合价值实时更新和收益计算
3. **数据完整性**: 事务保证交易数据一致性
4. **用户体验**: 响应式设计，图表可视化
5. **可扩展性**: 模块化设计，便于功能添加

这个架构支持用户从历史特定日期开始，基于真实市场数据进行股票交易学习和练习，是一个完整的教育培训平台。
