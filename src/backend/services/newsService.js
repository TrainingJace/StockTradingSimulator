// 新闻服务实现
const axios = require('axios');

class NewsService {
  constructor() {
    this.db = require('../database/database');
    this.API_KEY = 'd20ttppr01qvvf1k47lgd20ttppr01qvvf1k47m0'; // Finnhub API Key
    this.ALPHA_VANTAGE_API_KEY =  process.env.NEWS_API_KEY || 'demo'; // Alpha Vantage API Key
    console.log('NewsService initialized');
  }

  // 从 Alpha Vantage API 获取新闻并存储到数据库
  async fetchAndStoreNews(symbol, maxNews = 5) {
    console.log(`=== Fetching and storing news for ${symbol} ===`);

    try {
      const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`;

      console.log('Fetching from URL:', url);

      // 调用 API
      const response = await axios.get(url);

      console.log(`📊 API Response for ${symbol}:`);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Feed length:', response.data.feed ? response.data.feed.length : 'No feed');

      if (!response.data.feed) {
        console.warn(`⚠️ No news for ${symbol}`);
        return { success: true, stored: 0 };
      }

      let storedCount = 0;

      // 处理新闻数据
      for (const item of response.data.feed) {
        try {
          // 查找 ticker_sentiment 中是否包含该 symbol
          const matched = item.ticker_sentiment.find(t => t.ticker === symbol);
          if (!matched) continue;

          // 转换日期格式 "20250730T052349" -> "2025-07-30"
          const timePublished = item.time_published;
          const date = `${timePublished.slice(0, 4)}-${timePublished.slice(4, 6)}-${timePublished.slice(6, 8)}`;

          // 检查是否已存在相同的新闻
          const existingQuery = `
            SELECT id FROM news 
            WHERE symbol = ? AND title = ? AND published_date = ?
          `;
          const existing = await this.db.execute(existingQuery, [symbol, item.title, date]);

          if (existing.length === 0) {
            // 插入新闻
            await this.db.execute(
              `INSERT INTO news (symbol, title, summary, content, source, sentiment_score, published_date, url)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                symbol,
                item.title || '',
                item.summary || '',
                item.summary || '', // 使用 summary 作为 content
                item.source || '',
                matched.ticker_sentiment_score ? parseFloat(matched.ticker_sentiment_score).toFixed(2) : null,
                date,
                item.url || ''
              ]
            );
            storedCount++;
            console.log(`Stored news: ${item.title?.substring(0, 50)}...`);
          } else {
            console.log(`News already exists: ${item.title?.substring(0, 50)}...`);
          }

          if (storedCount >= maxNews) break;

        } catch (newsError) {
          console.error('Error storing individual news item:', newsError.message);
        }
      }

      console.log(`✅ ${symbol}: Successfully stored ${storedCount} new news items`);
      return { success: true, stored: storedCount };

    } catch (error) {
      console.error(`❌ ${symbol}: Failed to fetch news - ${error.message}`);
      return { success: false, error: error.message };
    }
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

      // 第一步：检查该 symbol 的新闻数
      const symbolCountQuery = 'SELECT COUNT(*) as symbolTotal FROM news WHERE symbol = ?';
      const symbolCountResult = await this.db.execute(symbolCountQuery, [symbol]);
      const symbolNewsCount = symbolCountResult[0]?.symbolTotal || 0;
      console.log(`News count for ${symbol}:`, symbolNewsCount);

      // 如果没有该 symbol 的新闻，从 API 获取并存储
      if (symbolNewsCount === 0) {
        console.log(`No news found for ${symbol}, fetching from API...`);
        const fetchResult = await this.fetchAndStoreNews(symbol, 5);

        if (fetchResult.success) {
          console.log(`Successfully fetched and stored ${fetchResult.stored} news items for ${symbol}`);
        } else {
          console.log(`Failed to fetch news from API: ${fetchResult.error}`);
          // 即使API调用失败，也继续尝试从数据库查询（可能有其他来源的数据）
        }
      }

      // 第二步：从数据库获取新闻
      console.log('Fetching news from database...');

      // 构造主查询 - 获取最新的新闻
      const query = `
      SELECT id, symbol, title, summary, content, source, sentiment_score, published_date, created_at, url
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
        created_at: row.created_at,
        url: row.url
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
