/**
 * 股票历史数据服务
 * 负责获取和存储股票历史数据
 */

const axios = require('axios');

class StockHistoryService {
  constructor() {
    this.db = require('../database/database');
    this.API_KEY = process.env.STOCK_API_KEY;
    this.BASE_URL = 'https://api.twelvedata.com';
    console.log('StockHistoryService initialized with API key:', this.API_KEY ? 'configured' : 'missing');
  }

  /**
   * 检查股票历史数据是否存在
   * @param {string} symbol - 股票代码
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {Promise<boolean>} - 是否存在数据
   */
  async checkHistoryDataExists(symbol, startDate, endDate) {
    try {
      const query = `
        SELECT COUNT(*) as count 
        FROM stock_history 
        WHERE symbol = ? AND date >= ? AND date <= ?
      `;
      const result = await this.db.execute(query, [symbol, startDate, endDate]);
      const count = result[0].count;
      
      // 检查是否有足够的数据点（至少应该有几百个交易日）
      const hasEnoughData = count > 200; // 一年大约250个交易日
      console.log(`📊 ${symbol} 历史数据检查: ${count} 条记录, 足够: ${hasEnoughData}`);
      
      return hasEnoughData;
    } catch (error) {
      console.error(`❌ 检查 ${symbol} 历史数据失败:`, error);
      return false;
    }
  }

  /**
   * 从API获取股票历史数据
   * @param {string} symbol - 股票代码
   * @param {string} startDate - 开始日期 (YYYY-MM-DD)
   * @param {string} endDate - 结束日期 (YYYY-MM-DD)
   * @returns {Promise<Array>} - 历史数据数组
   */
  async fetchHistoryDataFromAPI(symbol, startDate, endDate) {
    try {
      console.log(`🌐 正在获取 ${symbol} 从 ${startDate} 到 ${endDate} 的历史数据...`);
      
      if (!this.API_KEY) {
        throw new Error('Stock API key not configured');
      }

      const url = `${this.BASE_URL}/time_series`;
      const params = {
        symbol: symbol,
        interval: '1day',
        start_date: startDate,
        end_date: endDate,
        apikey: this.API_KEY,
        format: 'JSON'
      };

      console.log(`📡 API请求: ${url}`, params);
      
      const response = await axios.get(url, {
        params,
        timeout: 30000 // 30秒超时
      });

      console.log(`📥 API响应状态: ${response.status}`);
      
      if (!response.data || !response.data.values) {
        console.warn(`⚠️  ${symbol} API响应数据格式不正确:`, response.data);
        return [];
      }

      const values = response.data.values;
      console.log(`📊 ${symbol} 获取到 ${values.length} 条历史数据`);

      // 转换数据格式
      const historyData = values.map(item => ({
        symbol: symbol,
        date: item.datetime,
        open_price: parseFloat(item.open),
        high_price: parseFloat(item.high),
        low_price: parseFloat(item.low),
        close_price: parseFloat(item.close),
        volume: parseInt(item.volume) || 0
      }));

      return historyData;
    } catch (error) {
      console.error(`❌ 获取 ${symbol} 历史数据失败:`, error.message);
      
      if (error.response) {
        console.error('API响应错误:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      throw error;
    }
  }

  /**
   * 批量保存历史数据到数据库
   * @param {Array} historyData - 历史数据数组
   * @returns {Promise<number>} - 插入的记录数
   */
  async saveHistoryData(historyData) {
    if (!historyData || historyData.length === 0) {
      return 0;
    }

    try {
      console.log(`💾 正在保存 ${historyData.length} 条历史数据...`);
      
      const insertQuery = `
        INSERT IGNORE INTO stock_history 
        (symbol, date, open_price, high_price, low_price, close_price, volume)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      let insertedCount = 0;
      
      // 批量插入，每次插入100条记录
      const batchSize = 100;
      for (let i = 0; i < historyData.length; i += batchSize) {
        const batch = historyData.slice(i, i + batchSize);
        
        for (const data of batch) {
          try {
            const result = await this.db.execute(insertQuery, [
              data.symbol,
              data.date,
              data.open_price,
              data.high_price,
              data.low_price,
              data.close_price,
              data.volume
            ]);
            
            if (result.affectedRows > 0) {
              insertedCount++;
            }
          } catch (error) {
            // 忽略重复数据错误，继续处理其他数据
            if (!error.message.includes('Duplicate entry')) {
              console.warn(`⚠️  插入数据失败:`, error.message, data);
            }
          }
        }
        
        console.log(`💾 已处理 ${Math.min(i + batchSize, historyData.length)}/${historyData.length} 条记录`);
      }

      console.log(`✅ 成功插入 ${insertedCount} 条历史数据`);
      return insertedCount;
    } catch (error) {
      console.error('❌ 保存历史数据失败:', error);
      throw error;
    }
  }

  /**
   * 为单个股票获取并保存历史数据
   * @param {string} symbol - 股票代码
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<boolean>} - 是否成功
   */
  async fetchAndSaveStockHistory(symbol, startDate, endDate) {
    try {
      console.log(`🔄 开始处理 ${symbol} 的历史数据...`);
      
      // 检查是否已存在数据
      const exists = await this.checkHistoryDataExists(symbol, startDate, endDate);
      if (exists) {
        console.log(`✅ ${symbol} 历史数据已存在，跳过`);
        return true;
      }

      // 从API获取数据
      const historyData = await this.fetchHistoryDataFromAPI(symbol, startDate, endDate);
      
      if (historyData.length === 0) {
        console.warn(`⚠️  ${symbol} 未获取到历史数据`);
        return false;
      }

      // 保存到数据库
      const insertedCount = await this.saveHistoryData(historyData);
      
      console.log(`✅ ${symbol} 历史数据处理完成，插入 ${insertedCount} 条记录`);
      return insertedCount > 0;
    } catch (error) {
      console.error(`❌ 处理 ${symbol} 历史数据失败:`, error.message);
      return false;
    }
  }

  /**
   * 批量处理多个股票的历史数据
   * @param {Array<string>} symbols - 股票代码数组
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @returns {Promise<Object>} - 处理结果统计
   */
  async batchFetchStockHistory(symbols, startDate, endDate) {
    console.log(`🚀 开始批量处理 ${symbols.length} 个股票的历史数据...`);
    console.log(`📅 时间范围: ${startDate} 到 ${endDate}`);
    
    const results = {
      total: symbols.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };

    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      console.log(`\n📊 处理进度: ${i + 1}/${symbols.length} - ${symbol}`);
      
      try {
        // 检查是否已存在数据
        const exists = await this.checkHistoryDataExists(symbol, startDate, endDate);
        if (exists) {
          results.skipped++;
          results.details.push({ symbol, status: 'skipped', message: '数据已存在' });
          console.log(`⏭️  ${symbol} 数据已存在，跳过`);
          continue;
        }

        // 获取并保存数据
        const success = await this.fetchAndSaveStockHistory(symbol, startDate, endDate);
        
        if (success) {
          results.success++;
          results.details.push({ symbol, status: 'success', message: '数据获取成功' });
        } else {
          results.failed++;
          results.details.push({ symbol, status: 'failed', message: '数据获取失败' });
        }

        // 添加延迟，避免API频率限制
        if (i < symbols.length - 1) {
          console.log('⏳ 等待1秒，避免API频率限制...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        results.failed++;
        results.details.push({ 
          symbol, 
          status: 'error', 
          message: error.message 
        });
        console.error(`❌ ${symbol} 处理失败:`, error.message);
      }
    }

    console.log('\n📈 批量处理完成:');
    console.log(`✅ 成功: ${results.success}`);
    console.log(`❌ 失败: ${results.failed}`);
    console.log(`⏭️  跳过: ${results.skipped}`);
    console.log(`📊 总计: ${results.total}`);

    return results;
  }

  /**
   * 获取股票历史数据（从数据库）
   * @param {string} symbol - 股票代码
   * @param {string} startDate - 开始日期
   * @param {string} endDate - 结束日期
   * @param {number} limit - 限制记录数
   * @returns {Promise<Array>} - 历史数据
   */
  async getHistoryData(symbol, startDate = null, endDate = null, limit = null) {
    try {
      console.log(`History data requested for ${symbol} from ${startDate} to ${endDate} with limit ${limit}`);
      let query = `
        SELECT symbol, price_time, open_price, high_price, low_price, close_price, volume, created_at
        FROM stock_real_history 
        WHERE symbol = ?
      `;
      const params = [symbol];

      if (startDate) {
        query += ' AND DATE(price_time) >= DATE(?)';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(price_time) <= DATE(?)';
        params.push(endDate);
      }

      query += ' ORDER BY price_time DESC';

      if (limit) {
        query += ` LIMIT ${limit}`;
      }

      const result = await this.db.execute(query, params);
     
      return result;
    } catch (error) {
      console.error(`获取 ${symbol} 历史数据失败:`, error);
      return [];
    }
  }
}

module.exports = new StockHistoryService();
