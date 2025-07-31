const axios = require('axios');
const mysql = require('mysql2/promise');

// === 配置信息 ===
const API_KEY = 'd20ttppr01qvvf1k47lgd20ttppr01qvvf1k47m0';
const SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX'];
const FROM = '2025-07-01';
const TO = '2025-07-30';
const MAX_NEWS = 5;

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'stock_simulator',
};

// === 拉取单只股票新闻并写入数据库 ===
async function fetchNews(symbol, conn) {
    const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${FROM}&to=${TO}&token=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const newsList = response.data.slice(0, MAX_NEWS);

        for (const news of newsList) {
            const {
                headline,
                summary,
                source,
                datetime,
                url: newsUrl
            } = news;

            const date = new Date(datetime * 1000).toISOString().split('T')[0];

            await conn.execute(
                `INSERT INTO news (symbol, title, summary, content, source, sentiment_score, published_date, url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    symbol,
                    headline,
                    summary || '',
                    summary || '',
                    source || '',
                    null, // 没有情绪得分字段
                    date,
                    newsUrl
                ]
            );
        }

        console.log(`✅ ${symbol}: 插入 ${newsList.length} 条新闻`);
    } catch (err) {
        console.error(`❌ ${symbol}: 拉取失败 - ${err.message}`);
    }
}

// === 主函数入口 ===
(async () => {
    const conn = await mysql.createConnection(dbConfig);
    console.log("🟢 数据库连接成功");

    for (const symbol of SYMBOLS) {
        await fetchNews(symbol, conn);
    }

    await conn.end();
    console.log("✅ 所有新闻处理完成");
})();
