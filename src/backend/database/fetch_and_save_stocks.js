const axios = require('axios');
const mysql = require('mysql2/promise');

const symbols = [
    'AAPL', 'GOOGL', 'MSFT', 'TSLA',
    'AMZN', 'NVDA', 'META', 'NFLX'
];
const apiKey = 'TTFO5NMW8G9LKPV6';

async function main() {
    // 连接数据库
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'stock_simulator'
    });

    for (let symbol of symbols) {
        try {
            const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;
            const { data } = await axios.get(url);

            if (!data.Symbol) {
                console.error(`未找到数据: ${symbol}`, data);
                continue;
            }

            // 字段映射
            const fields = {
                description: data.Description || null,
                cik: data.CIK || null,
                exchange: data.Exchange || null,
                currency: data.Currency || null,
                country: data.Country || null,
                address: data.Address || null,
                officialSite: data.OfficialSite || data.Website || null,
                marketCapitalization: data.MarketCapitalization || null,
                ebitda: data.EBITDA || null,
                peRatio: data.PERatio || null,
                pegRatio: data.PEGRatio || null,
                bookValue: data.BookValue || null,
            };

            // 插入或更新
            await db.execute(
                `UPDATE stocks SET
          description = ?,
          cik = ?,
          exchange = ?,
          currency = ?,
          country = ?,
          address = ?,
          officialSite = ?,
          marketCapitalization = ?,
          ebitda = ?,
          peRatio = ?,
          pegRatio = ?,
          bookValue = ?
        WHERE symbol = ?`,
                [
                    fields.description,
                    fields.cik,
                    fields.exchange,
                    fields.currency,
                    fields.country,
                    fields.address,
                    fields.officialSite,
                    fields.marketCapitalization,
                    fields.ebitda,
                    fields.peRatio,
                    fields.pegRatio,
                    fields.bookValue,
                    symbol
                ]
            );

            console.log(`已更新: ${symbol}`);
            await new Promise(res => setTimeout(res, 15000)); // 防API限流，建议15秒一次
        } catch (err) {
            console.error(`处理${symbol}失败:`, err.message);
        }
    }

    await db.end();
    console.log('全部完成！');
}

main();
