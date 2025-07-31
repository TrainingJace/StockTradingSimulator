// newsFetcher.js
import axios from 'axios';
import mysql from 'mysql2/promise';

const API_KEY = 'TTFO5NMW8G9LKPV6';
const TICKERS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
const MAX_NEWS_PER_SYMBOL = 5;

// 数据库连接配置
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stock_simulator',
};

// 插入新闻的 SQL 语句
const insertNewsSQL = `
  INSERT INTO news (symbol, title, summary, content, source, sentiment_score, published_date, url)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

async function fetchAndStoreNews(symbol, connection) {
    try {
        const url = `https://www.alphavantage.co/query?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${API_KEY}`;
        const response = await axios.get(url);

        console.log(`📊 API Response for ${symbol}:`);
        console.log('Full response data:', JSON.stringify(response.data, null, 2));
        console.log('Response status:', response.status);
        console.log('Feed length:', response.data.feed ? response.data.feed.length : 'No feed');

        if (!response.data.feed) {
            console.warn(`⚠️ No news for ${symbol}`);
            return;
        }

        const newsItems = [];
        for (const item of response.data.feed) {
            // 查找 ticker_sentiment 中是否包含该 symbol
            const matched = item.ticker_sentiment.find(t => t.ticker === symbol);
            if (!matched) continue;

            newsItems.push([
                symbol,
                item.title,
                item.summary || null,
                item.summary || null, // content 使用 summary 填充
                item.source,
                parseFloat(matched.ticker_sentiment_score).toFixed(2),
                item.time_published.slice(0, 8), // "20250730T052349" -> "20250730"
                item.url
            ]);

            if (newsItems.length >= MAX_NEWS_PER_SYMBOL) break;
        }

        // 批量插入
        for (const row of newsItems) {
            await connection.execute(insertNewsSQL, row);
        }

        console.log(`✅ Inserted ${newsItems.length} news for ${symbol}`);
    } catch (error) {
        console.error(`❌ Error for ${symbol}:`, error.message);
    }
}

async function main() {
    const connection = await mysql.createConnection(dbConfig);
    console.log('🟢 Connected to DB');

    for (const symbol of TICKERS) {
        await fetchAndStoreNews(symbol, connection);
    }

    await connection.end();
    console.log('🔚 All done');
}

main();
