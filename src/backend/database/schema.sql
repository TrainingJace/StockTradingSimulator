-- 表结构定义（仅包含CREATE TABLE语句）
-- 这个文件被 database.js 使用来创建表

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  signup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  trial_start DATE,
  simulation_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 创建投资组合表
CREATE TABLE IF NOT EXISTS portfolios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  initial_balance DECIMAL(15,2) DEFAULT 500000.00, -- 初始资金50万
  cash_balance DECIMAL(15,2) DEFAULT 500000.00,
  total_value DECIMAL(15,2) DEFAULT 500000.00,
  total_cost DECIMAL(15,2) DEFAULT 0.00,
  total_return DECIMAL(15,2) DEFAULT 0.00,
  total_return_percent DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 创建持仓表
CREATE TABLE IF NOT EXISTS positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  portfolio_id INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  shares INT NOT NULL,
  avg_cost DECIMAL(10,2) NOT NULL,
  total_cost DECIMAL(15,2) NOT NULL,
  current_price DECIMAL(10,2) DEFAULT 0.00,
  current_value DECIMAL(15,2) DEFAULT 0.00,
  unrealized_gain DECIMAL(15,2) DEFAULT 0.00,
  unrealized_gain_percent DECIMAL(5,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_portfolio_symbol (portfolio_id, symbol)
) ENGINE=InnoDB;

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  portfolio_id INT NOT NULL,
  type ENUM('BUY', 'SELL') NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  shares INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total DECIMAL(15,2) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 创建股票信息表
CREATE TABLE IF NOT EXISTS stocks (
  id INT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sector VARCHAR(50),
  industry VARCHAR(100),
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  previous_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  change_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  change_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  volume BIGINT DEFAULT 0,
  market_cap BIGINT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 创建观察列表表
CREATE TABLE IF NOT EXISTS watchlists (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_symbol (user_id, symbol)
) ENGINE=InnoDB;

-- 创建股票历史数据表
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

-- 创建新闻表
CREATE TABLE IF NOT EXISTS news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(10),
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  content TEXT,
  source VARCHAR(100),
  sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
  published_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_symbol_date (symbol, published_date)
) ENGINE=InnoDB;

-- 创建投资组合价值历史表
CREATE TABLE IF NOT EXISTS portfolio_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  portfolio_id INT NOT NULL,
  date DATE NOT NULL,
  total_value DECIMAL(15,2) NOT NULL,
  cash_balance DECIMAL(15,2) NOT NULL,
  unrealized_gain DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE,
  UNIQUE KEY unique_portfolio_date (portfolio_id, date)
) ENGINE=InnoDB;
