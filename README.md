# 📈 股票交易模拟器

一个功能完整的股票交易模拟系统，支持用户注册登录、实时股价查看、投资组合管理等功能。

## ✨ 功能特色

- 🔐 **用户认证系统** - JWT token 认证，密码加密存储
- 📊 **实时股价展示** - 支持多种股票的价格查看和搜索
- 💼 **投资组合管理** - 个人投资组合追踪和管理
- 📈 **交易历史记录** - 完整的买卖交易记录
- 🎨 **响应式设计** - 支持桌面端和移动端
- 🗄️ **真实数据库** - MySQL 数据持久化存储

## 🚀 一键安装

### 方法一：使用自动安装脚本（推荐）

#### macOS/Linux:
```bash
chmod +x install.sh
./install.sh
```

#### Windows:
```cmd
install.bat
```

### 方法二：手动安装

#### 0. 安装软件
安装nodejs
安装mysql server

#### 1. 安装依赖
npm run install:all

#### 2. 环境配置
将server/.env.example 复制一份为 server/.env
并将server/.env 中的 "DB_PASS="  修改为自己的mysql root用户密码， 比如 "DB_PASS=123456"



#### 3. 启动应用

在根目录下用命令行执行 npm run dev， 如无报错， 可在浏览器使用 http://localhost:5173/ 访问页面

## 🔧 配置说明

### 环境变量 (.env)

```env
# 应用模式
MODE=real                    # real: 使用真实数据库, test: 使用模拟数据

# 服务器配置
PORT=3001                    # 后端服务器端口

# 数据库配置
DB_HOST=localhost            # 数据库主机
DB_PORT=3306                 # 数据库端口
DB_NAME=stock_simulator      # 数据库名称
DB_USER=root                 # 数据库用户名
DB_PASS=your_mysql_password  # 数据库密码

# JWT 配置
JWT_SECRET=your-secret-key   # JWT 签名密钥

# API 密钥 (可选)
STOCK_API_KEY=your_api_key   # 股票数据 API 密钥
NEWS_API_KEY=your_news_key   # 新闻 API 密钥
```

## 🌐 访问地址

- **前端应用**: http://localhost:5174
- **后端 API**: http://localhost:3001
- **API 文档**: http://localhost:3001/api

## 📋 API 接口

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/verify` - Token 验证
- `GET /api/auth/me` - 获取当前用户信息

### 股票相关
- `GET /api/stocks?symbols=AAPL,GOOGL` - 获取股票价格
- `GET /api/stocks/:symbol` - 获取单个股票
- `GET /api/stocks/search?q=apple` - 搜索股票
- `GET /api/stocks/market/status` - 获取市场状态

### 投资组合相关
- `GET /api/portfolio/user/:userId` - 获取投资组合
- `POST /api/portfolio/user/:userId/trade` - 执行交易
- `GET /api/portfolio/user/:userId/transactions` - 获取交易历史

## �️ 项目结构

```
StockTradingSimulator/
├── client/                 # 前端 React 应用
│   ├── src/
│   │   ├── api/           # API 接口
│   │   ├── components/    # React 组件
│   │   ├── pages/         # 页面组件
│   │   └── hooks/         # 自定义 Hooks
│   └── package.json
├── server/                 # 后端 Node.js API
│   ├── config/            # 配置文件
│   ├── controllers/       # 控制器
│   ├── middleware/        # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── services/         # 业务逻辑
│   └── package.json
├── database_setup.sql      # 数据库初始化脚本
├── install.sh             # Linux/macOS 安装脚本
├── install.bat            # Windows 安装脚本
├── start-dev.sh           # 开发环境启动脚本
└── start-prod.sh          # 生产环境启动脚本
```

## 📊 数据库结构

### users 表
- `id` - 用户ID (主键，自增)
- `username` - 用户名 (唯一)
- `password` - 密码 (加密存储)
- `email` - 邮箱 (可选，唯一)
- `signup_date` - 注册日期
- `trial_start` - 模拟开始日期
- `simulation_date` - 当前模拟日期

### portfolios 表
- `id` - 投资组合ID
- `user_id` - 用户ID (外键)
- `cash_balance` - 现金余额
- `total_value` - 总资产价值
- `total_return` - 总收益

### positions 表
- `id` - 持仓ID
- `portfolio_id` - 投资组合ID (外键)
- `symbol` - 股票代码
- `shares` - 持股数量
- `avg_cost` - 平均成本

### transactions 表
- `id` - 交易ID
- `user_id` - 用户ID (外键)
- `type` - 交易类型 (BUY/SELL)
- `symbol` - 股票代码
- `shares` - 交易股数
- `price` - 交易价格

## �️ 开发

### 启动开发环境

```bash
# 使用便捷脚本
./start-dev.sh              # Linux/macOS
start-dev.bat               # Windows

# 或手动启动
cd server && MODE=real node app.js &
cd client && npm run dev
```

### 代码规范

- 前端使用 ESLint 进行代码检查
- 后端遵循 Node.js 最佳实践
- 使用 Prettier 进行代码格式化

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 是否正在运行
   - 验证 `.env` 文件中的数据库配置
   - 确认数据库用户权限

2. **端口被占用**
   - 更改 `.env` 文件中的 `PORT` 配置
   - 或终止占用端口的进程

3. **依赖安装失败**
   - 清除 `node_modules` 重新安装
   - 检查 Node.js 版本是否兼容

4. **macOS 上 MySQL 检测失败**
   - 如果通过官方安装包安装 MySQL，需要添加到 PATH：
   ```bash
   echo 'export PATH="/usr/local/mysql/bin:$PATH"' >> ~/.zshrc
   source ~/.zshrc
   ```
   - 启动 MySQL 服务：
   ```bash
   sudo /usr/local/mysql/support-files/mysql.server start
   ```
   - 手动创建数据库和用户：
   ```bash
   mysql -u root -p < database_setup.sql
   ```

5. **MySQL 服务未启动**
   - macOS: `sudo /usr/local/mysql/support-files/mysql.server start`
   - 或通过系统偏好设置 → MySQL 启动服务

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请查看：
1. [常见问题](#故障排除)
2. [项目 Issues](../../issues)
3. [项目文档](./docs/)

---

**享受您的股票交易模拟体验！** 📈✨


