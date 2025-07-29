// 新闻服务实现
class NewsService {
  constructor() {
    this.db = require('../database/database');
    console.log('NewsService initialized');
  }


  async getStockNews(symbol, limit = 3) {
    console.log('\n=== NEWS SERVICE: getStockNews ===');
    console.log(`Input params: symbol=${symbol}, limit=${limit}`);

    try {
      // 参数校验
      if (!symbol) {
        throw new Error('Missing required parameter: symbol is required.');
      }

      const parsedLimit = parseInt(limit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        throw new Error('Limit must be a positive integer.');
      }

      console.log('Cleaned params:', { symbol, parsedLimit });

      // 检查 news 表总数
      const countQuery = 'SELECT COUNT(*) as total FROM news';
      const countResult = await this.db.execute(countQuery);
      const totalNewsCount = countResult[0]?.total || 0;
      console.log('Total news count:', totalNewsCount);

      if (totalNewsCount === 0) {
        console.log('No news in database, return empty array.');
        return [];
      }

      // 检查该 symbol 的新闻数
      const symbolCountQuery = 'SELECT COUNT(*) as symbolTotal FROM news WHERE symbol = ?';
      const symbolCountResult = await this.db.execute(symbolCountQuery, [symbol]);
      const symbolNewsCount = symbolCountResult[0]?.symbolTotal || 0;
      console.log(`News count for ${symbol}:`, symbolNewsCount);

      // 测试简单查询
      const simpleQuery = 'SELECT id, symbol, title FROM news WHERE symbol = ? LIMIT 1';
      const simpleResult = await this.db.execute(simpleQuery, [symbol]);
      console.log('Simple query result (first title):', simpleResult[0]?.title || 'No result');

      // 构造主查询 - 获取最新的新闻
      const query = `
      SELECT id, symbol, title, summary, content, source, sentiment_score, published_date, created_at
      FROM news
      WHERE symbol = ?
      ORDER BY published_date DESC
      LIMIT ${parsedLimit}
    `;
      const queryParams = [symbol];

      console.log('Executing main query:', query.trim());
      console.log('With params:', queryParams);

      const rows = await this.db.execute(query, queryParams);
      console.log(`Fetched ${rows.length} rows.`);

      const result = rows.map(row => ({
        id: row.id,
        symbol: row.symbol,
        title: row.title,
        summary: row.summary,
        content: row.content,
        source: row.source,
        sentiment_score: row.sentiment_score,
        published_date: row.published_date,
        created_at: row.created_at
      }));

      console.log('Final result:', JSON.stringify(result, null, 2));
      console.log('=== END OF getStockNews ===\n');
      return result;
    } catch (error) {
      console.error('=== ERROR in getStockNews ===');
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
      console.error('===========================\n');
      throw error;
    }
  }

  // 获取市场整体新闻
  async getMarketNews(startDate, endDate, limit = 20) {
    console.log(`Getting market news from ${startDate} to ${endDate}`);
    try {
      // TODO: 实现获取市场新闻的逻辑
      // 1. 查询通用新闻（symbol为空的记录）
      // 2. 筛选日期范围
      throw new Error('Not implemented yet');
    } catch (error) {
      console.error('Error getting market news:', error);
      throw error;
    }
  }

  // 添加新闻（用于数据导入）
  async addNews(newsData) {
    console.log('Adding news:', newsData.title);
    try {
      // TODO: 实现添加新闻的逻辑
      // 1. 验证新闻数据
      // 2. 插入到news表
      throw new Error('Not implemented yet');
    } catch (error) {
      console.error('Error adding news:', error);
      throw error;
    }
  }

  // 批量导入新闻数据
  async importNewsData(newsArray) {
    console.log(`Importing ${newsArray.length} news items`);
    try {
      // TODO: 实现批量导入新闻的逻辑
      throw new Error('Not implemented yet');
    } catch (error) {
      console.error('Error importing news data:', error);
      throw error;
    }
  }
}

module.exports = new NewsService();
