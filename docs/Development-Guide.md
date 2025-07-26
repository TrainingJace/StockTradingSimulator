# Stock Trading Simulator 开发指南

## 📁 项目结构

```
StockTradingSimulator/
├── src/
│   ├── frontend/           # React 前端应用
│   │   ├── src/
│   │   │   ├── pages/      # 页面组件
│   │   │   ├── api/        # API 调用
│   │   │   ├── hooks/      # React Hooks
│   │   │   └── components/ # 复用组件
│   │   └── package.json
│   └── backend/            # Node.js 后端 API
│       ├── app.js          # 应用入口
│       ├── routes/         # 路由定义
│       ├── controllers/    # 业务逻辑处理
│       ├── services/      ## 📝 开发流程总结

```

## 🚀 快速启动

### 1. 安装依赖
```bash
# 运行安装脚本
./scripts/install.sh    # macOS/Linux
# 或
scripts/install.bat     # Windows
```

<!-- 手动安装 -->
1. npm install
2. copy .env.example to .env, set DB_PASS

### 2. 启动开发服务器
```bash
npm run dev
```

- 前端地址: http://localhost:5173
- 后端地址: http://localhost:3001

## 📖 核心概念

### 前端架构

#### 入口文件
- `src/frontend/src/main.jsx` - React 应用入口
- `src/frontend/src/App.jsx` - 主应用组件

#### 文件夹功能
- **pages/**: 页面组件，每个页面一个文件夹，包含 `index.jsx` 和 `*.css`
- **api/**: 后端接口调用函数，按功能模块分文件
- **hooks/**: React 自定义 Hooks，用于封装状态逻辑和数据获取
- **components/**: 可复用的 UI 组件

#### Hooks 的作用
Hooks 用来封装业务逻辑，让组件更简洁：
```javascript
// hooks/useStock.js - 封装股票数据获取逻辑
export function useStock(symbol) {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const fetchStock = async () => {
    setLoading(true);
    const data = await stockApi.getStock(symbol);
    setStock(data);
    setLoading(false);
  };
  
  return { stock, loading, fetchStock };
}
```

### 后端架构

#### 入口文件
- `src/backend/app.js` - Express 服务器入口

#### 文件夹功能
- **routes/**: URL 路由定义，决定哪个 URL 调用哪个 Controller
- **controllers/**: 处理 HTTP 请求，调用 Service 层，返回响应
- **services/**: 业务逻辑处理，数据库操作，外部 API 调用
- **database/**: 数据库连接、表结构、初始数据

#### 请求流程详解

```
用户点击 → 前端组件 → Hook → API调用 → 后端路由 → Controller → Service → 数据库
                                                                         ↓
页面更新 ← 前端组件 ← Hook ← API响应 ← 后端路由 ← Controller ← Service ← 查询结果
```

**完整示例：用户搜索 AAPL 股票价格**

#### 1. 前端组件触发
```javascript
// src/frontend/src/pages/StockDashboard/index.jsx
function StockDashboard() {
  const { stock, loading, fetchStock } = useStock();

  const handleSearch = () => {
    fetchStock('AAPL'); // 🎯 用户点击，调用 Hook
  };

  return (
    <div>
      <button onClick={handleSearch}>获取股价</button>
      {stock && <div>价格: ${stock.price}</div>}
    </div>
  );
}
```

#### 2. Hook 管理状态
```javascript
// src/frontend/src/hooks/useStock.js
export function useStock() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStock = async (symbol) => {
    setLoading(true);
    const data = await stockApi.getStock(symbol); // 🔄 调用 API 层
    setStock(data); // 📊 更新状态，触发组件重渲染
    setLoading(false);
  };

  return { stock, loading, fetchStock };
}
```

#### 3. API 层发送请求
```javascript
// src/frontend/src/api/stockApi.js
export const stockApi = {
  async getStock(symbol) {
    // 🌐 发送 HTTP 请求到后端
    const response = await apiClient.get(`/stocks/${symbol}`);
    return response.data.data; // 📦 返回数据给 Hook
  }
};
```

#### 4. 后端路由接收
```javascript
// src/backend/routes/stocks.js
const router = express.Router();

// 🛣️ 匹配 GET /api/stocks/AAPL
router.get('/:symbol', stockController.getStock); // 🎯 调用 Controller
```

#### 5. Controller 处理请求
```javascript
// src/backend/controllers/stockController.js
class StockController {
  async getStock(req, res) {
    const { symbol } = req.params; // � 解析参数: AAPL
    
    // 🔄 调用 Service 层获取数据
    const stockData = await stockService.getStockPrice(symbol);
    
    // 📤 返回格式化的响应
    res.json({
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        price: stockData.price,
        change: stockData.change,
        timestamp: new Date().toISOString()
      }
    });
  }
}
```

#### 6. Service 业务逻辑
```javascript
// src/backend/services/stockService.js
class StockService {
  async getStockPrice(symbol) {
    // 🗄️ 先查数据库缓存
    const cached = await this.getCachedStock(symbol);
    
    if (cached && this.isCacheValid(cached.updated_at)) {
      return cached; // 💾 返回缓存数据
    }

    // 🌐 缓存过期，调用外部 API
    const freshData = await this.fetchFromExternalAPI(symbol);
    
    // 💾 更新缓存
    await this.updateCache(symbol, freshData);
    
    return freshData; // � 返回最新数据
  }

  async getCachedStock(symbol) {
    const query = `SELECT price, change_amount, updated_at FROM stock_cache WHERE symbol = ?`;
    const [rows] = await db.execute(query, [symbol]);
    return rows[0] || null;
  }
}
```

#### 数据流转过程
```
1. 用户输入: "AAPL"
   ↓
2. Hook 接收: fetchStock("AAPL")
   ↓  
3. API 发送: GET /api/stocks/AAPL
   ↓
4. 路由匹配: /stocks/:symbol → stockController.getStock
   ↓
5. Controller 解析: req.params.symbol = "AAPL"
   ↓
6. Service 查询: stockService.getStockPrice("AAPL")
   ↓
7. 数据库查询: SELECT * FROM stock_cache WHERE symbol = "AAPL"
   ↓
8. 数据返回: { price: 150.25, change: 2.35 }
   ↓
9. 层层返回: Service → Controller → API → Hook → 组件
   ↓
10. 页面更新: 显示 "价格: $150.25"
```

这就是一个完整的数据流！每层都有明确职责：
- **组件**: 处理用户交互
- **Hook**: 管理状态和副作用  
- **API**: 处理 HTTP 通信
- **路由**: URL 路径匹配
- **Controller**: 请求处理和响应
- **Service**: 业务逻辑和数据操作

## 🛠️ 开发新功能示例：历史投资页面

假设要开发"我的历史投资"页面，需要按以下步骤：

### 1. 数据库设计
```sql
-- 在 src/backend/database/schema.sql 添加
CREATE TABLE investment_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  stock_symbol VARCHAR(10) NOT NULL,
  action ENUM('BUY', 'SELL') NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 后端开发 

#### 2.1 先定义路由 (API 接口规划)
```javascript
// src/backend/routes/investment.js
const express = require('express');
const investmentController = require('../controllers/investmentController');

const router = express.Router();

// 获取用户投资历史
router.get('/history/:userId', investmentController.getHistory);

// 添加投资记录
router.post('/', investmentController.addInvestment);

module.exports = router;
```

#### 2.2 注册路由到主路由
```javascript
// src/backend/routes/index.js
const investmentRouter = require('./investment');

// 添加这一行
router.use('/investment', investmentRouter);
```

#### 2.3 创建 Controller (处理请求)
```javascript
// src/backend/controllers/investmentController.js
const investmentService = require('../services/investmentService');

class InvestmentController {
  async getHistory(req, res) {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }
      
      const history = await investmentService.getInvestmentHistory(userId);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error getting investment history:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to get investment history' 
      });
    }
  }
  
  async addInvestment(req, res) {
    try {
      const { userId, stockSymbol, action, quantity, price } = req.body;
      
      // 参数验证
      if (!userId || !stockSymbol || !action || !quantity || !price) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }
      
      await investmentService.addInvestment(
        userId, 
        stockSymbol, 
        action, 
        quantity, 
        price
      );
      
      res.json({ success: true, message: 'Investment added successfully' });
    } catch (error) {
      console.error('Error adding investment:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to add investment' 
      });
    }
  }
}

module.exports = new InvestmentController();
```

#### 2.4 创建 Service (业务逻辑和数据处理)
```javascript
// src/backend/services/investmentService.js
const db = require('../database/database');

class InvestmentService {
  async getInvestmentHistory(userId) {
    const query = `
      SELECT 
        id,
        stock_symbol,
        action,
        quantity,
        price,
        created_at
      FROM investment_history 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
  
  async addInvestment(userId, stockSymbol, action, quantity, price) {
    const query = `
      INSERT INTO investment_history 
      (user_id, stock_symbol, action, quantity, price) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    await db.execute(query, [userId, stockSymbol, action, quantity, price]);
  }
  
  // 可选：获取用户总投资统计
  async getInvestmentSummary(userId) {
    const query = `
      SELECT 
        stock_symbol,
        SUM(CASE WHEN action = 'BUY' THEN quantity ELSE -quantity END) as net_quantity,
        COUNT(*) as total_transactions
      FROM investment_history 
      WHERE user_id = ? 
      GROUP BY stock_symbol
      HAVING net_quantity > 0
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }
}

module.exports = new InvestmentService();
```

### 3. 前端开发

#### 3.1 先创建页面组件 (UI 界面)
```javascript
// src/frontend/src/pages/InvestmentHistory/index.jsx
import React from 'react';
import './InvestmentHistory.css';

function InvestmentHistory() {
  // 先用模拟数据开发界面
  const mockHistory = [
    {
      id: 1,
      stock_symbol: 'AAPL',
      action: 'BUY',
      quantity: 10,
      price: 150.00,
      created_at: '2024-01-01T10:00:00Z'
    },
    {
      id: 2,
      stock_symbol: 'GOOGL',
      action: 'SELL',
      quantity: 5,
      price: 2800.00,
      created_at: '2024-01-02T14:30:00Z'
    }
  ];
  
  return (
    <div className="investment-history">
      <h1>我的历史投资</h1>
      <table>
        <thead>
          <tr>
            <th>股票代码</th>
            <th>操作</th>
            <th>数量</th>
            <th>价格</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {mockHistory.map(item => (
            <tr key={item.id}>
              <td>{item.stock_symbol}</td>
              <td className={item.action === 'BUY' ? 'buy' : 'sell'}>
                {item.action}
              </td>
              <td>{item.quantity}</td>
              <td>${item.price}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvestmentHistory;
```

#### 3.2 添加页面样式
```css
/* src/frontend/src/pages/InvestmentHistory/InvestmentHistory.css */
.investment-history {
  padding: 20px;
}

.investment-history table {
  width: 100%;
  border-collapse: collapse;
}

.investment-history th,
.investment-history td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.investment-history .buy {
  color: green;
  font-weight: bold;
}

.investment-history .sell {
  color: red;
  font-weight: bold;
}
```

#### 3.3 添加路由 (让页面可访问)
```javascript
// src/frontend/src/App.jsx
import InvestmentHistory from './pages/InvestmentHistory';

function App() {
  return (
    <Router>
      <Routes>
        {/* 其他已有路由 */}
        <Route path="/investment-history" element={<InvestmentHistory />} />
      </Routes>
    </Router>
  );
}
```

#### 3.4 创建 API 调用 (连接后端)
```javascript
// src/frontend/src/api/investmentApi.js
import apiClient from './client';

export const investmentApi = {
  async getHistory(userId) {
    const response = await apiClient.get(`/investment/history/${userId}`);
    return response.data;
  },
  
  async addInvestment(investmentData) {
    const response = await apiClient.post('/investment', investmentData);
    return response.data;
  }
};
```

#### 3.5 创建 Hook (封装数据逻辑)
```javascript
// src/frontend/src/hooks/useInvestment.js
import { useState, useEffect } from 'react';
import { investmentApi } from '../api';

export function useInvestment(userId) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchHistory = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await investmentApi.getHistory(userId);
      setHistory(data);
    } catch (err) {
      setError('获取投资历史失败');
      console.error('Failed to fetch investment history:', err);
    }
    setLoading(false);
  };
  
  const addInvestment = async (investmentData) => {
    try {
      await investmentApi.addInvestment(investmentData);
      fetchHistory(); // 重新获取最新数据
    } catch (err) {
      setError('添加投资记录失败');
      throw err;
    }
  };
  
  useEffect(() => {
    fetchHistory();
  }, [userId]);
  
  return { 
    history, 
    loading, 
    error,
    addInvestment, 
    fetchHistory 
  };
}
```

#### 3.6 更新页面使用真实数据
```javascript
// src/frontend/src/pages/InvestmentHistory/index.jsx - 最终版本
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useInvestment } from '../../hooks/useInvestment';
import './InvestmentHistory.css';

function InvestmentHistory() {
  const { user } = useAuth();
  const { history, loading, error } = useInvestment(user?.id);
  
  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">错误: {error}</div>;
  if (!history.length) return <div className="empty">暂无投资记录</div>;
  
  return (
    <div className="investment-history">
      <h1>我的历史投资</h1>
      <table>
        <thead>
          <tr>
            <th>股票代码</th>
            <th>操作</th>
            <th>数量</th>
            <th>价格</th>
            <th>时间</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.stock_symbol}</td>
              <td className={item.action === 'BUY' ? 'buy' : 'sell'}>
                {item.action}
              </td>
              <td>{item.quantity}</td>
              <td>${item.price}</td>
              <td>{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default InvestmentHistory;
```

## � 开发流程总结

1. **设计数据库表结构** - 在 `database/schema.sql` 添加表
2. **后端开发**:
   - Service: 数据库操作逻辑
   - Controller: HTTP 请求处理
   - Route: URL 路径映射
3. **前端开发**:
   - API: 封装后端接口调用
   - Hook: 封装状态和业务逻辑
   - Page: 页面 UI 组件
   - 路由: 添加页面访问路径

这样就完成了一个完整功能的开发！

