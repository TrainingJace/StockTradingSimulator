const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config/index');
const { insertTestStocks } = require('./seed-data');

class Database {
  constructor() {
    this.pool = null;
  }

  async init() {
    try {
      // 先连接到MySQL服务器（不指定数据库）
      const tempPool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        waitForConnections: true,
        connectionLimit: 1
      });

      // 创建数据库（如果不存在）
      const [rows] = await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${config.database.name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Database '${config.database.name}' ensured`);
      
      // 关闭临时连接
      await tempPool.end();

      // 创建主连接池（连接到具体数据库）
      this.pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.name,
        waitForConnections: true,
        connectionLimit: config.database.maxConnections,
        queueLimit: 0,
        acquireTimeout: 60000,
        timeout: 60000,
        reconnect: true
      });

      // 测试连接
      const connection = await this.pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();

      // 创建表
      await this.createTables();
      
      // 在测试模式下插入种子数据
      if (process.env.MODE === 'test') {
        await insertTestStocks(this);
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  async createTables() {
    try {
      console.log('📋 Creating database tables...');
      
      // 读取SQL表结构文件
      const schemaPath = path.join(__dirname, 'schema.sql');
      console.log('📁 Reading schema from:', schemaPath);
      
      if (!fs.existsSync(schemaPath)) {
        throw new Error(`Schema file not found: ${schemaPath}`);
      }
      
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      console.log('📄 Schema file loaded, length:', schemaSql.length);
      
      // 移除注释行和空行，然后按分号分割
      const cleanSql = schemaSql
        .split('\n')
        .filter(line => {
          const trimmed = line.trim();
          return trimmed.length > 0 && !trimmed.startsWith('--');
        })
        .join('\n');
      
      // 按分号分割SQL语句
      const statements = cleanSql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      console.log('🔍 Found', statements.length, 'SQL statements');
      
      // 执行每个CREATE TABLE语句
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE IF NOT EXISTS\s+(\w+)/i)?.[1];
          console.log(`🔨 Creating table: ${tableName}`);
          
          try {
            await this.execute(statement);
            console.log(`✅ Table ${tableName} created successfully`);
          } catch (error) {
            console.error(`❌ Failed to create table ${tableName}:`, error.message);
            console.error('SQL statement:', statement);
            throw error;
          }
        }
      }

      console.log('✅ All database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  async execute(query, params = []) {
    if (!this.pool) {
      throw new Error('Database not initialized');
    }
    try {
      const [rows] = await this.pool.execute(query, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async beginTransaction() {
    const connection = await this.pool.getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

module.exports = new Database();
