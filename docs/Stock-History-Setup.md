# 股票历史数据自动初始化功能

## 功能说明

本项目已实现股票历史数据的自动初始化功能。在项目启动时，系统会：

1. **检查股票数据**：向 `stocks` 表插入8个测试公司的基本信息
2. **检查历史数据**：检查 `stock_history` 表是否包含这8个公司的历史数据
3. **自动获取数据**：如果历史数据缺失，会自动调用Twelve Data API获取2020-01-01到2025-01-01的历史数据
4. **数据存储**：将获取的历史数据存储到数据库中

## 包含的股票

系统会自动获取以下8只股票的历史数据：

- **AAPL** - Apple Inc.
- **GOOGL** - Alphabet Inc.
- **MSFT** - Microsoft Corporation
- **TSLA** - Tesla Inc.
- **AMZN** - Amazon.com Inc.
- **NVDA** - NVIDIA Corporation
- **META** - Meta Platforms Inc.
- **NFLX** - Netflix Inc.

## API配置

### 1. 获取API密钥

1. 访问 [Twelve Data](https://twelvedata.com/)
2. 注册账户并获取免费API密钥
3. 免费账户通常有每分钟800次请求的限制

### 2. 配置环境变量

在项目根目录的 `.env` 文件中设置：

```env
STOCK_API_KEY=your_twelve_data_api_key_here
```

## 启动项目

```bash
# 进入后端目录
cd src/backend

# 安装依赖
npm install

# 启动项目
npm start
```

启动时会看到类似的日志输出：

```
🔄 初始化股票历史数据...
📊 检查 8 个股票的历史数据 (2020-01-01 到 2025-01-01)
🔍 股票列表: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META, NFLX
🌐 需要获取历史数据的股票: AAPL, GOOGL, MSFT
⚠️  注意: 这个过程可能需要几分钟时间，请耐心等待...
📊 处理进度: 1/3 - AAPL
✅ AAPL 历史数据处理完成，插入 1250 条记录
...
📈 历史数据初始化完成
✅ 成功获取: 3 个股票
❌ 获取失败: 0 个股票
⏭️  已存在跳过: 5 个股票
```

## API端点

### 1. 检查历史数据状态

```http
GET /api/stocks/history/status
```

返回每个股票的历史数据状态，包括记录数量和日期范围。

### 2. 手动初始化历史数据

```http
POST /api/stocks/history/initialize
```

手动触发历史数据初始化过程（如果启动时失败）。

### 3. 获取股票历史数据

```http
GET /api/stocks/{symbol}/history?startDate=2023-01-01&endDate=2023-12-31
```

获取特定股票的历史数据。

## 数据库表结构

### stock_history 表

```sql
CREATE TABLE IF NOT EXISTS stock_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  open_price DECIMAL(10,2) NOT NULL,
  high_price DECIMAL(10,2) NOT NULL,
  low_price DECIMAL(10,2) NOT NULL,
  close_price DECIMAL(10,2) NOT NULL,
  volume BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_symbol_date (symbol, date)
) ENGINE=InnoDB;
```

## 错误处理

- **API限制**：系统会在请求之间添加1秒延迟，避免超出API频率限制
- **网络错误**：如果API调用失败，会记录错误但不会阻止应用启动
- **重复数据**：使用 `INSERT IGNORE` 避免重复插入相同日期的数据
- **数据验证**：检查数据完整性，只有当数据量达到阈值才认为初始化成功

## 注意事项

1. **首次启动**：首次运行时需要时间下载历史数据，请耐心等待
2. **API配额**：免费API有请求限制，如果超出限制可能需要等待
3. **数据更新**：历史数据通常不需要频繁更新，系统会跳过已存在的数据
4. **错误恢复**：如果初始化失败，可以使用手动初始化端点重试

## 日志监控

系统会输出详细的日志信息，包括：

- 📊 数据检查状态
- 🌐 API调用信息
- 💾 数据保存进度
- ✅ 成功/失败统计
- ❌ 错误详情

通过这些日志可以监控初始化过程和排查问题。
