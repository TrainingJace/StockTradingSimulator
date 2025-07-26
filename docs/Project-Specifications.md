# 📋 Project Specifications

## 🎯 项目目标

Stock Trading Simulator 是一个教育性质的股票交易模拟平台，旨在：

1. **教育目的**: 帮助用户学习股票交易基础知识
2. **培训工具**: 为金融机构提供员工培训平台
3. **风险控制**: 在虚拟环境中练习投资策略
4. **历史分析**: 基于历史数据进行回测和分析

---

## 🏗️ 技术架构规范

### 整体架构
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│   React Client  │ ◄──── API ────► │  Express Server │
│   (Port 5173)   │                 │   (Port 3001)   │
└─────────────────┘                 └─────────────────┘
```

### 技术栈要求

#### 前端技术栈
- **框架**: React 18+ with Hooks
- **构建工具**: Vite (快速开发和构建)
- **模块系统**: ES6 Modules
- **状态管理**: React内置状态 + 自定义Hooks
- **HTTP客户端**: Fetch API
- **CSS方案**: CSS Modules 或 Styled Components

#### 后端技术栈
- **运行时**: Node.js 16+
- **框架**: Express 5+
- **模块系统**: CommonJS
- **环境配置**: dotenv
- **跨域**: cors
- **数据格式**: JSON

#### 开发工具
- **并发运行**: concurrently
- **代码规范**: ESLint
- **版本控制**: Git
- **包管理**: npm

---

## 📁 目录结构规范

### 后端目录结构
```
server/
├── app.js                  # 应用入口点
├── .env                    # 环境变量配置
├── package.json            # 依赖和脚本
├── routes/                 # 路由层
│   ├── index.js           # 路由聚合器
│   ├── users.js           # 用户相关路由
│   ├── stocks.js          # 股票相关路由
│   └── portfolio.js       # 投资组合路由
├── controllers/            # 控制器层
│   ├── userController.js
│   ├── stockController.js
│   └── portfolioController.js
├── services/               # 服务层（业务逻辑）
│   ├── index.js           # 服务自动加载器
│   ├── userService.mock.js
│   ├── userService.real.js
│   ├── stockService.mock.js
│   ├── stockService.real.js
│   ├── portfolioService.mock.js
│   └── portfolioService.real.js
├── models/                 # 数据模型层
│   ├── User.js
│   ├── Stock.js
│   └── Portfolio.js
├── utils/                  # 工具函数
│   ├── dateTime.js
│   └── financial.js
└── config/                 # 配置文件
    └── index.js
```

### 前端目录结构
```
client/
├── index.html              # HTML模板
├── vite.config.js          # Vite配置
├── package.json            # 依赖和脚本
├── public/                 # 静态资源
│   └── vite.svg
└── src/                    # 源代码
    ├── main.jsx           # React入口点
    ├── App.jsx            # 根组件
    ├── App.css            # 全局样式
    ├── api/               # API调用层
    │   ├── index.js       # API统一导出
    │   ├── client.js      # HTTP客户端
    │   ├── userApi.js     # 用户API
    │   ├── stockApi.js    # 股票API
    │   └── portfolioApi.js # 投资组合API
    ├── hooks/              # 自定义Hooks
    │   ├── index.js       # Hooks统一导出
    │   ├── useUser.js     # 用户相关Hook
    │   ├── useStock.js    # 股票相关Hook
    │   └── usePortfolio.js # 投资组合Hook
    ├── components/         # 可复用组件
    │   ├── common/        # 通用组件
    │   ├── forms/         # 表单组件
    │   └── charts/        # 图表组件
    ├── pages/              # 页面组件
    │   ├── Dashboard.jsx  # 仪表板
    │   ├── Portfolio.jsx  # 投资组合页面
    │   ├── StockDetail.jsx # 股票详情
    │   └── Trading.jsx    # 交易页面
    └── assets/             # 资源文件
        └── react.svg
```

---

## 🔧 代码规范

### 命名规范

#### 文件命名
- **组件文件**: PascalCase (`UserProfile.jsx`)
- **工具文件**: camelCase (`dateUtils.js`)
- **服务文件**: `serviceName.type.js` (`userService.mock.js`)
- **API文件**: camelCase + Api (`userApi.js`)
- **Hook文件**: `useXxxYyy.js` (`useUserProfile.js`)

#### 变量命名
```javascript
// ✅ 推荐
const userId = 1;
const stockPrice = 175.25;
const userPortfolio = {};
const isLoading = false;

// ❌ 不推荐
const user_id = 1;
const stock_price = 175.25;
const UserPortfolio = {};
const loading = false;
```

#### 函数命名
```javascript
// ✅ 推荐 - 动词开头
async function getUserById(id) {}
async function createPortfolio(data) {}
async function executeTradeOrder(order) {}

// ❌ 不推荐
async function userById(id) {}
async function portfolio(data) {}
async function trade(order) {}
```

### API 规范

#### 端点命名
```
GET    /api/users              # 获取用户列表
GET    /api/users/:id          # 获取特定用户
POST   /api/users              # 创建用户
PUT    /api/users/:id          # 更新用户
DELETE /api/users/:id          # 删除用户

GET    /api/stocks/:symbol     # 获取股票信息
GET    /api/stocks/search      # 搜索股票

GET    /api/portfolio/user/:userId           # 获取投资组合
POST   /api/portfolio/user/:userId/trade     # 执行交易
```

#### 响应格式
```javascript
// 成功响应
{
  "success": true,
  "data": {
    // 实际数据
  }
}

// 错误响应
{
  "success": false,
  "error": "具体错误信息",
  "code": "ERROR_CODE" // 可选
}
```

#### HTTP状态码使用
- `200` - 成功获取资源
- `201` - 成功创建资源
- `400` - 客户端请求错误
- `401` - 未认证
- `403` - 无权限
- `404` - 资源不存在
- `409` - 资源冲突
- `500` - 服务器内部错误

### 服务层规范

#### 服务文件结构
```javascript
// services/xxxService.mock.js
class XxxService {
  async methodName(params) {
    console.log(`[MOCK] 描述操作: ${params}`);
    // Mock 数据逻辑
    return mockData;
  }
}

module.exports = new XxxService();
```

```javascript
// services/xxxService.real.js
class XxxService {
  async methodName(params) {
    console.log(`[REAL] 描述操作: ${params}`);
    try {
      // 真实数据库/API调用
      return realData;
    } catch (error) {
      console.error('Error in service:', error);
      throw error;
    }
  }
}

module.exports = new XxxService();
```

### 错误处理规范

#### 后端错误处理
```javascript
// Controller 层
async function getUser(req, res) {
  try {
    const { userId } = req.params;
    
    // 参数验证
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID is required' 
      });
    }

    const user = await services.userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
```

#### 前端错误处理
```javascript
// Hook 中的错误处理
export function useUser(userId) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const userData = await userApi.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  return { user, loading, error };
}
```

---

## 🔄 环境配置规范

### 环境变量
```env
# 服务模式
MODE=test                    # test | prod

# 服务器配置
PORT=3001

# 外部API配置（生产环境）
STOCK_API_KEY=your_api_key
NEWS_API_KEY=your_news_key

# 数据库配置（生产环境）
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stock_simulator
DB_USER=postgres
DB_PASS=password

# 日志配置
LOG_LEVEL=info               # debug | info | warn | error
```

### 服务切换机制
1. **自动检测**: 根据 `MODE` 环境变量自动选择服务实现
2. **统一接口**: 所有服务提供相同的方法签名
3. **透明切换**: 业务代码无需修改即可切换数据源

---

## 📊 数据模型规范

### 用户模型
```typescript
interface User {
  id: number;                    // 用户唯一标识
  username: string;              // 用户名（3-20字符）
  email: string;                 // 邮箱地址
  balance: number;               // 账户余额
  createdAt: string;             // 创建时间（ISO格式）
  updatedAt?: string;            // 更新时间（ISO格式）
}
```

### 股票模型
```typescript
interface Stock {
  symbol: string;                // 股票代码（大写）
  name: string;                  // 公司名称
  price: number;                 // 当前价格
  change: number;                // 价格变化
  changePercent: number;         // 变化百分比
  volume: number;                // 交易量
  marketCap: number;             // 市值
  lastUpdated: string;           // 最后更新时间
}
```

### 交易模型
```typescript
interface Transaction {
  id: number;                    // 交易唯一标识
  userId: number;                // 用户ID
  portfolioId: number;           // 投资组合ID
  type: 'BUY' | 'SELL';         // 交易类型
  symbol: string;                // 股票代码
  shares: number;                // 股票数量
  price: number;                 // 交易价格
  total: number;                 // 交易总额
  timestamp: string;             // 交易时间戳
}
```

### 持仓模型
```typescript
interface Position {
  id: number;                    // 持仓唯一标识
  portfolioId: number;           // 投资组合ID
  symbol: string;                // 股票代码
  shares: number;                // 持有股数
  avgCost: number;               // 平均成本
  currentPrice: number;          // 当前价格
  totalCost: number;             // 总成本
  currentValue: number;          // 当前价值
  unrealizedGain: number;        // 未实现收益
  unrealizedGainPercent: number; // 未实现收益率
}
```

---

## 🧪 测试规范

### Mock 数据标准
1. **一致性**: Mock 数据应该反映真实数据结构
2. **完整性**: 包含足够的测试用例和边界情况
3. **可预测性**: 相同输入应产生相同输出

### API 测试覆盖
- ✅ 正常情况测试
- ✅ 边界条件测试  
- ✅ 错误情况测试
- ✅ 参数验证测试

### 测试数据集
```javascript
// 用户测试数据
const testUsers = [
  { id: 1, username: "john_doe", balance: 10000 },
  { id: 2, username: "jane_smith", balance: 15000 }
];

// 股票测试数据
const testStocks = [
  { symbol: "AAPL", price: 175.25, change: 2.50 },
  { symbol: "GOOGL", price: 145.80, change: -1.20 }
];
```

---

## 🚀 部署规范

### 开发环境
- 使用 `MODE=test` 模式
- 启用详细日志
- 支持热重载

### 生产环境
- 使用 `MODE=prod` 模式
- 连接真实数据源
- 启用性能监控
- 实施安全策略

### 构建流程
1. 前端构建: `npm run client:build`
2. 依赖检查: 确保所有依赖已安装
3. 环境配置: 设置生产环境变量
4. 服务启动: `npm run start`

---

## 📝 文档规范

### API 文档要求
- 包含完整的端点列表
- 提供请求/响应示例
- 标明参数类型和验证规则
- 包含错误代码说明

### 代码注释规范
```javascript
/**
 * 获取用户投资组合信息
 * @param {number} userId - 用户ID
 * @param {Object} options - 可选参数
 * @param {boolean} options.includeTransactions - 是否包含交易历史
 * @returns {Promise<Portfolio>} 投资组合对象
 * @throws {Error} 当用户不存在时抛出错误
 */
async function getPortfolio(userId, options = {}) {
  // 实现逻辑
}
```

---

## 🔒 安全规范

### 数据验证
- 所有用户输入必须验证
- 使用类型检查和范围验证
- 防止 SQL 注入和 XSS 攻击

### 错误信息
- 不暴露敏感系统信息
- 提供用户友好的错误提示
- 记录详细的服务端错误日志

### 环境变量安全
- 不在代码中硬编码敏感信息
- 使用 `.env` 文件管理配置
- 生产环境使用环境变量

---

## 📈 性能规范

### 响应时间要求
- API 响应时间 < 200ms (Mock 模式)
- API 响应时间 < 1s (生产模式)
- 前端页面渲染 < 100ms

### 资源使用限制
- 内存使用 < 512MB
- CPU 使用率 < 70%
- 网络带宽合理使用

### 缓存策略
- 股价数据缓存 60 秒
- 历史数据缓存 1 小时
- 用户数据适当缓存

---

## 🔄 版本管理规范

### Git 分支策略
- `main`: 主分支，包含稳定代码
- `develop`: 开发分支，集成最新功能
- `feature/*`: 功能分支
- `hotfix/*`: 紧急修复分支

### 提交信息格式
```
类型(范围): 简短描述

详细描述（可选）

- 变更项1
- 变更项2
```

示例:
```
feat(api): 添加股票搜索接口

实现根据关键词搜索股票的功能

- 支持按公司名称搜索
- 支持按股票代码搜索
- 添加搜索结果缓存
```

---

## 📞 联系方式

- **项目仓库**: https://github.com/TrainingJace/StockTradingSimulator
- **Issue 跟踪**: GitHub Issues
- **文档维护**: 请提交 PR 更新

---

这份规范文档确保项目的一致性、可维护性和可扩展性。所有团队成员都应遵循这些规范进行开发。
