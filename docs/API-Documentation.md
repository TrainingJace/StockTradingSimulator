# Stock Trading Simulator API Documentation

## API Base URL
```
Development: http://localhost:3001/api
Production: https://your-domain.com/api
```

## Authentication
目前版本不需要认证，后续版本将添加 JWT 认证。

---

## 📊 API Overview

| Service | Endpoint Base | Description |
|---------|---------------|-------------|
| Users | `/api/users` | 用户管理相关接口 |
| Stocks | `/api/stocks` | 股票数据相关接口 |
| Portfolio | `/api/portfolio` | 投资组合相关接口 |
| System | `/api` | 系统状态接口 |

---

## 🏥 System APIs

### Health Check
检查系统运行状态

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "Stock Trading Simulator API is running",
  "timestamp": "2024-01-01T10:00:00.000Z",
  "environment": "test"
}
```

### API Information
获取 API 基本信息和所有端点列表

**Endpoint:** `GET /api`

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Stock Trading Simulator API",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "stocks": "/api/stocks",
    "portfolio": "/api/portfolio",
    "health": "/api/health"
  },
  "documentation": {
    "users": {...},
    "stocks": {...},
    "portfolio": {...}
  }
}
```

---

## 👤 User APIs

### Get User by ID
根据用户 ID 获取用户信息

**Endpoint:** `GET /api/users/:userId`

**Parameters:**
- `userId` (path, required): 用户 ID

**Example Request:**
```bash
curl http://localhost:3001/api/users/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "balance": 10000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "User not found"
}
```

### Get User by Username
根据用户名获取用户信息

**Endpoint:** `GET /api/users/username/:username`

**Parameters:**
- `username` (path, required): 用户名

**Example Request:**
```bash
curl http://localhost:3001/api/users/username/john_doe
```

**Response:** 同 Get User by ID

### Create User
创建新用户

**Endpoint:** `POST /api/users`

**Request Body:**
```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "balance": 15000  // optional, default: 10000
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "new_user",
    "email": "newuser@example.com",
    "balance": 15000
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 3,
    "username": "new_user",
    "email": "newuser@example.com",
    "balance": 15000,
    "createdAt": "2024-01-01T10:00:00.000Z"
  }
}
```

**Validation Errors:**
```json
{
  "success": false,
  "error": "Username and email are required"
}
```

### Update User Balance
更新用户余额

**Endpoint:** `PUT /api/users/:userId/balance`

**Parameters:**
- `userId` (path, required): 用户 ID

**Request Body:**
```json
{
  "balance": 12000
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3001/api/users/1/balance \
  -H "Content-Type: application/json" \
  -d '{"balance": 12000}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "balance": 12000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Users
获取所有用户列表（管理员功能）

**Endpoint:** `GET /api/users`

**Example Request:**
```bash
curl http://localhost:3001/api/users
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "balance": 10000,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "username": "jane_smith",
      "email": "jane@example.com",
      "balance": 15000,
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

---

## 📈 Stock APIs

### Get Stock Price
获取单个股票的当前价格信息

**Endpoint:** `GET /api/stocks/:symbol`

**Parameters:**
- `symbol` (path, required): 股票代码 (如: AAPL, GOOGL)

**Example Request:**
```bash
curl http://localhost:3001/api/stocks/AAPL
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc.",
    "price": 175.25,
    "change": 2.50,
    "changePercent": 1.45,
    "volume": 45234567,
    "marketCap": 2850000000000,
    "lastUpdated": "2024-01-01T16:00:00.000Z"
  }
}
```

### Get Multiple Stocks
获取多个股票的价格信息

**Endpoint:** `GET /api/stocks`

**Query Parameters:**
- `symbols` (query, required): 逗号分隔的股票代码列表

**Example Request:**
```bash
curl "http://localhost:3001/api/stocks?symbols=AAPL,GOOGL,MSFT"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 175.25,
      "change": 2.50,
      "changePercent": 1.45,
      "volume": 45234567,
      "marketCap": 2850000000000,
      "lastUpdated": "2024-01-01T16:00:00.000Z"
    },
    {
      "symbol": "GOOGL",
      "name": "Alphabet Inc.",
      "price": 145.80,
      "change": -1.20,
      "changePercent": -0.82,
      "volume": 23456789,
      "marketCap": 1820000000000,
      "lastUpdated": "2024-01-01T16:00:00.000Z"
    }
  ]
}
```

### Get Historical Data
获取股票的历史价格数据

**Endpoint:** `GET /api/stocks/:symbol/history`

**Parameters:**
- `symbol` (path, required): 股票代码

**Query Parameters:**
- `startDate` (query, required): 开始日期 (YYYY-MM-DD)
- `endDate` (query, required): 结束日期 (YYYY-MM-DD)

**Example Request:**
```bash
curl "http://localhost:3001/api/stocks/AAPL/history?startDate=2024-01-01&endDate=2024-01-31"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-01",
      "open": 172.50,
      "high": 175.80,
      "low": 171.20,
      "close": 175.25,
      "volume": 45234567
    },
    {
      "date": "2023-12-31",
      "open": 170.20,
      "high": 173.50,
      "low": 169.80,
      "close": 172.75,
      "volume": 42345678
    }
  ]
}
```

### Search Stocks
根据关键词搜索股票

**Endpoint:** `GET /api/stocks/search`

**Query Parameters:**
- `q` (query, required): 搜索关键词 (最少1个字符)

**Example Request:**
```bash
curl "http://localhost:3001/api/stocks/search?q=apple"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "price": 175.25,
      "change": 2.50,
      "changePercent": 1.45,
      "volume": 45234567,
      "marketCap": 2850000000000,
      "lastUpdated": "2024-01-01T16:00:00.000Z"
    }
  ]
}
```

### Get Market Status
获取市场开盘状态

**Endpoint:** `GET /api/stocks/market/status`

**Example Request:**
```bash
curl http://localhost:3001/api/stocks/market/status
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isOpen": true,
    "nextOpen": "2024-01-02T09:30:00.000Z",
    "nextClose": "2024-01-01T16:00:00.000Z",
    "timezone": "America/New_York"
  }
}
```

### Get Top Movers
获取涨跌幅排行榜

**Endpoint:** `GET /api/stocks/market/movers`

**Example Request:**
```bash
curl http://localhost:3001/api/stocks/market/movers
```

**Response:**
```json
{
  "success": true,
  "data": {
    "gainers": [
      {
        "symbol": "AAPL",
        "name": "Apple Inc.",
        "price": 175.25,
        "change": 2.50,
        "changePercent": 1.45,
        "volume": 45234567
      }
    ],
    "losers": [
      {
        "symbol": "GOOGL",
        "name": "Alphabet Inc.",
        "price": 145.80,
        "change": -1.20,
        "changePercent": -0.82,
        "volume": 23456789
      }
    ]
  }
}
```

---

## 📊 Portfolio APIs

### Get User Portfolio
获取用户的投资组合信息

**Endpoint:** `GET /api/portfolio/user/:userId`

**Parameters:**
- `userId` (path, required): 用户 ID

**Example Request:**
```bash
curl http://localhost:3001/api/portfolio/user/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "totalValue": 12500,
    "totalCost": 10000,
    "totalReturn": 2500,
    "totalReturnPercent": 25.0,
    "positions": [
      {
        "id": 1,
        "symbol": "AAPL",
        "shares": 10,
        "avgCost": 150.00,
        "currentPrice": 175.25,
        "totalCost": 1500,
        "currentValue": 1752.50,
        "unrealizedGain": 252.50,
        "unrealizedGainPercent": 16.83
      }
    ],
    "transactions": [
      {
        "id": 1,
        "type": "BUY",
        "symbol": "AAPL",
        "shares": 10,
        "price": 150.00,
        "total": 1500,
        "timestamp": "2024-01-01T10:00:00.000Z"
      }
    ]
  }
}
```

### Create Portfolio
为用户创建新的投资组合

**Endpoint:** `POST /api/portfolio/user/:userId`

**Parameters:**
- `userId` (path, required): 用户 ID

**Request Body:**
```json
{
  "initialBalance": 15000  // optional, default: 10000
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3001/api/portfolio/user/1 \
  -H "Content-Type: application/json" \
  -d '{"initialBalance": 15000}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "totalValue": 15000,
    "totalCost": 0,
    "totalReturn": 0,
    "totalReturnPercent": 0,
    "positions": [],
    "transactions": []
  }
}
```

### Execute Trade
执行买入或卖出交易

**Endpoint:** `POST /api/portfolio/user/:userId/trade`

**Parameters:**
- `userId` (path, required): 用户 ID

**Request Body:**
```json
{
  "symbol": "AAPL",      // required: 股票代码
  "shares": 10,          // required: 股数
  "price": 175.25,       // required: 价格
  "type": "BUY"          // required: 交易类型 (BUY/SELL)
}
```

**Example Request:**
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

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "userId": 1,
    "portfolioId": 1,
    "type": "BUY",
    "symbol": "AAPL",
    "shares": 10,
    "price": 175.25,
    "total": 1752.50,
    "timestamp": "2024-01-01T14:30:00.000Z"
  }
}
```

**Error Responses:**
```json
// 资金不足
{
  "success": false,
  "error": "Insufficient funds"
}

// 股票不足（卖出时）
{
  "success": false,
  "error": "Insufficient shares to sell"
}

// 无效的交易类型
{
  "success": false,
  "error": "Invalid trade type. Must be BUY or SELL"
}
```

### Get Transaction History
获取用户的交易历史记录

**Endpoint:** `GET /api/portfolio/user/:userId/transactions`

**Parameters:**
- `userId` (path, required): 用户 ID

**Query Parameters:**
- `limit` (query, optional): 返回记录数量限制，默认为 50

**Example Request:**
```bash
curl "http://localhost:3001/api/portfolio/user/1/transactions?limit=20"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "userId": 1,
      "portfolioId": 1,
      "type": "BUY",
      "symbol": "AAPL",
      "shares": 10,
      "price": 175.25,
      "total": 1752.50,
      "timestamp": "2024-01-01T14:30:00.000Z"
    },
    {
      "id": 1,
      "userId": 1,
      "portfolioId": 1,
      "type": "BUY",
      "symbol": "GOOGL",
      "shares": 5,
      "price": 140.00,
      "total": 700,
      "timestamp": "2024-01-02T10:00:00.000Z"
    }
  ]
}
```

### Update Portfolio Values
批量更新投资组合中股票的当前价格

**Endpoint:** `PUT /api/portfolio/user/:userId/values`

**Parameters:**
- `userId` (path, required): 用户 ID

**Request Body:**
```json
{
  "stockPrices": {
    "AAPL": 175.25,
    "GOOGL": 145.80,
    "MSFT": 415.50
  }
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3001/api/portfolio/user/1/values \
  -H "Content-Type: application/json" \
  -d '{
    "stockPrices": {
      "AAPL": 175.25,
      "GOOGL": 145.80
    }
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "totalValue": 12500,
    "totalCost": 10000,
    "totalReturn": 2500,
    "totalReturnPercent": 25.0,
    "positions": [
      {
        "id": 1,
        "symbol": "AAPL",
        "shares": 10,
        "avgCost": 150.00,
        "currentPrice": 175.25,
        "totalCost": 1500,
        "currentValue": 1752.50,
        "unrealizedGain": 252.50,
        "unrealizedGainPercent": 16.83
      }
    ]
  }
}
```

### Get Portfolio Statistics
获取投资组合的统计信息

**Endpoint:** `GET /api/portfolio/user/:userId/stats`

**Parameters:**
- `userId` (path, required): 用户 ID

**Query Parameters:**
- `period` (query, optional): 统计周期 (1D, 1W, 1M, 3M, 1Y)，默认为 1M

**Example Request:**
```bash
curl "http://localhost:3001/api/portfolio/user/1/stats?period=1M"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalValue": 12500,
    "totalReturn": 2500,
    "totalReturnPercent": 25.0,
    "dayChange": 125.50,
    "dayChangePercent": 1.02,
    "bestPerformer": {
      "symbol": "AAPL",
      "unrealizedGainPercent": 16.83
    },
    "worstPerformer": {
      "symbol": "GOOGL",
      "unrealizedGainPercent": 4.14
    },
    "diversity": 2,
    "period": "1M"
  }
}
```

---

## 🚨 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "Resource already exists"
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message in test mode"
}
```

---

## 📋 Data Models

### User Model
```typescript
interface User {
  id: number;
  username: string;
  email: string;
  balance: number;
  createdAt: string;
  updatedAt?: string;
}
```

### Stock Model
```typescript
interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  lastUpdated: string;
}
```

### Transaction Model
```typescript
interface Transaction {
  id: number;
  userId: number;
  portfolioId: number;
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}
```

### Position Model
```typescript
interface Position {
  id: number;
  portfolioId: number;
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
}
```

### Portfolio Model
```typescript
interface Portfolio {
  id: number;
  userId: number;
  totalValue: number;
  totalCost: number;
  totalReturn: number;
  totalReturnPercent: number;
  positions: Position[];
  transactions: Transaction[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 🔧 Environment Configuration

### Mock Mode (MODE=test)
- 使用内存中的模拟数据
- 适用于开发和测试环境
- 无需外部 API 或数据库连接

### Production Mode (MODE=prod)
- 连接真实数据库
- 调用外部股票 API
- 需要配置相应的 API keys

### Environment Variables
```env
MODE=test                    # test | prod
PORT=3001                    # 服务器端口
STOCK_API_KEY=your_key       # 股票 API 密钥
NEWS_API_KEY=your_key        # 新闻 API 密钥
DB_HOST=localhost            # 数据库主机
DB_PORT=5432                 # 数据库端口
DB_NAME=stock_simulator      # 数据库名称
DB_USER=postgres             # 数据库用户
DB_PASS=password             # 数据库密码
```

---

## 📝 API Testing Examples

### Complete User Flow Example
```bash
# 1. 创建用户
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "trader1", "email": "trader1@example.com"}'

# 2. 创建投资组合
curl -X POST http://localhost:3001/api/portfolio/user/3 \
  -H "Content-Type: application/json" \
  -d '{"initialBalance": 10000}'

# 3. 搜索股票
curl "http://localhost:3001/api/stocks/search?q=apple"

# 4. 获取股票价格
curl http://localhost:3001/api/stocks/AAPL

# 5. 执行买入交易
curl -X POST http://localhost:3001/api/portfolio/user/3/trade \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "AAPL",
    "shares": 10,
    "price": 175.25,
    "type": "BUY"
  }'

# 6. 查看投资组合
curl http://localhost:3001/api/portfolio/user/3

# 7. 查看交易历史
curl http://localhost:3001/api/portfolio/user/3/transactions
```

---

## 📞 Support

如有问题，请联系开发团队或查看项目 GitHub 仓库。

**项目地址:** https://github.com/TrainingJace/StockTradingSimulator
