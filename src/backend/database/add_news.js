const mysql = require('mysql2/promise');

const newsData = [
    // ----------- AAPL -----------
    {
        symbol: "AAPL",
        title: "Apple launches new AI-powered iPhone features",
        summary: "Apple unveiled new AI features in its latest iPhone lineup, focusing on productivity and security.",
        content: "At its September event, Apple introduced a suite of artificial intelligence tools for iPhone users, aimed at improving productivity, photo management, and device security. Analysts expect strong sales momentum heading into the holiday season.",
        source: "Bloomberg",
        sentiment_score: 0.67,
        published_date: "2024-07-15"
    },
    {
        symbol: "AAPL",
        title: "Apple's Services Revenue Hits All-Time High",
        summary: "Services segment, including iCloud and App Store, drives Apple's quarterly results.",
        content: "Apple reported a record $21 billion in services revenue in Q2 2024, offsetting modest iPhone hardware sales. The company cited growth in subscriptions and international expansion.",
        source: "Reuters",
        sentiment_score: 0.54,
        published_date: "2024-05-08"
    },
    {
        symbol: "AAPL",
        title: "Apple Faces Regulatory Scrutiny in Europe",
        summary: "EU regulators are investigating Apple's App Store practices.",
        content: "The European Commission launched an antitrust probe into Apple's App Store payment rules, following complaints from rival app developers.",
        source: "Financial Times",
        sentiment_score: -0.43,
        published_date: "2024-03-21"
    },
    {
        symbol: "AAPL",
        title: "Apple Announces Dividend Increase",
        summary: "Apple's board approved a quarterly dividend hike for shareholders.",
        content: "In its latest earnings call, Apple announced a 10% increase in quarterly dividends, citing strong free cash flow and long-term shareholder returns.",
        source: "CNBC",
        sentiment_score: 0.34,
        published_date: "2024-04-27"
    },
    {
        symbol: "AAPL",
        title: "Apple Expands Manufacturing in India",
        summary: "Apple is ramping up iPhone production at new facilities in India.",
        content: "Apple confirmed plans to expand manufacturing operations in India, aiming to reduce supply chain risks and tap into the growing South Asian market.",
        source: "The Wall Street Journal",
        sentiment_score: 0.46,
        published_date: "2024-06-19"
    },

    // ----------- GOOGL -----------
    {
        symbol: "GOOGL",
        title: "Google Unveils Search Engine Upgrades",
        summary: "Google launched new features to improve search relevance using AI.",
        content: "At its developer conference, Google showcased advancements in search, leveraging generative AI to provide more accurate and contextual results.",
        source: "TechCrunch",
        sentiment_score: 0.61,
        published_date: "2024-05-12"
    },
    {
        symbol: "GOOGL",
        title: "Alphabet Reports Declining Ad Revenue Growth",
        summary: "Ad revenue slowed in Q1 amid economic uncertainty.",
        content: "Alphabet, Google's parent company, posted a 4% decline in ad revenue growth year-over-year, citing market headwinds and advertiser caution.",
        source: "Bloomberg",
        sentiment_score: -0.29,
        published_date: "2024-04-28"
    },
    {
        symbol: "GOOGL",
        title: "Google to Acquire Cybersecurity Firm",
        summary: "Google announced plans to acquire a leading cybersecurity startup.",
        content: "The acquisition aims to strengthen Google Cloud's security offerings and support enterprise customers with advanced threat detection tools.",
        source: "Reuters",
        sentiment_score: 0.37,
        published_date: "2024-03-30"
    },
    {
        symbol: "GOOGL",
        title: "Google Faces DOJ Antitrust Lawsuit",
        summary: "The US Justice Department files lawsuit against Google.",
        content: "The US DOJ initiated legal proceedings against Google over alleged monopolistic practices in its search and advertising businesses.",
        source: "The Verge",
        sentiment_score: -0.56,
        published_date: "2024-06-10"
    },
    {
        symbol: "GOOGL",
        title: "Alphabet Announces New Stock Buyback",
        summary: "Alphabet's board authorized a new $70 billion stock buyback program.",
        content: "The buyback reflects Alphabet's strong balance sheet and ongoing commitment to returning capital to shareholders.",
        source: "Yahoo Finance",
        sentiment_score: 0.47,
        published_date: "2024-07-01"
    },

    // ----------- MSFT -----------
    {
        symbol: "MSFT",
        title: "Microsoft Introduces Copilot AI for Office Suite",
        summary: "Microsoft brings generative AI features to Word, Excel, and PowerPoint.",
        content: "The new Copilot assistant, powered by GPT-4, helps users create content, analyze data, and automate tasks across the Microsoft 365 suite.",
        source: "ZDNet",
        sentiment_score: 0.72,
        published_date: "2024-05-15"
    },
    {
        symbol: "MSFT",
        title: "Microsoft Cloud Revenue Surges",
        summary: "Azure and cloud services drive record quarterly growth.",
        content: "Microsoft's cloud division reported a 19% year-over-year revenue increase, buoyed by strong demand from enterprise clients.",
        source: "CNBC",
        sentiment_score: 0.53,
        published_date: "2024-04-20"
    },
    {
        symbol: "MSFT",
        title: "Microsoft Invests in Quantum Computing Startup",
        summary: "Microsoft deepens bet on next-gen computing technologies.",
        content: "Microsoft led a $300 million funding round for a promising quantum computing startup, aiming to accelerate breakthroughs in quantum hardware.",
        source: "The Wall Street Journal",
        sentiment_score: 0.39,
        published_date: "2024-07-04"
    },
    {
        symbol: "MSFT",
        title: "Microsoft Faces Antitrust Investigation in EU",
        summary: "EU regulators look into Microsoft's Teams integration with Office.",
        content: "The European Commission is probing whether bundling Teams with Office suite stifles competition among business communication platforms.",
        source: "Financial Times",
        sentiment_score: -0.51,
        published_date: "2024-06-15"
    },
    {
        symbol: "MSFT",
        title: "Microsoft Announces Dividend Increase",
        summary: "Microsoft boosts quarterly dividend amid strong cash flow.",
        content: "The board approved a 7% dividend hike, reflecting continued strength in cloud and software businesses.",
        source: "Yahoo Finance",
        sentiment_score: 0.36,
        published_date: "2024-03-28"
    },

    // ----------- TSLA -----------
    {
        symbol: "TSLA",
        title: "Tesla Launches Next-Gen Model 3",
        summary: "Tesla unveiled the new Model 3 with longer range and updated design.",
        content: "Tesla's latest Model 3 features improved battery technology, extended range, and refreshed styling, aiming to maintain its EV leadership.",
        source: "Electrek",
        sentiment_score: 0.66,
        published_date: "2024-06-11"
    },
    {
        symbol: "TSLA",
        title: "Tesla Faces Recall Over Software Glitch",
        summary: "Tesla announced a voluntary recall due to a software issue affecting autopilot.",
        content: "The company recalled 120,000 vehicles after discovering a software bug that may cause unexpected braking in certain conditions.",
        source: "Reuters",
        sentiment_score: -0.45,
        published_date: "2024-04-22"
    },
    {
        symbol: "TSLA",
        title: "Tesla Expands Gigafactory Berlin",
        summary: "Tesla is investing $1B to expand its Berlin facility.",
        content: "The expansion will increase production capacity and create over 2,000 new jobs, supporting growth in the European EV market.",
        source: "Bloomberg",
        sentiment_score: 0.41,
        published_date: "2024-07-10"
    },
    {
        symbol: "TSLA",
        title: "Tesla Q2 Deliveries Beat Estimates",
        summary: "Tesla reported record deliveries for Q2 2024.",
        content: "With 480,000 vehicles delivered in Q2, Tesla exceeded analyst expectations, driven by strong demand in North America and China.",
        source: "CNBC",
        sentiment_score: 0.59,
        published_date: "2024-07-17"
    },
    {
        symbol: "TSLA",
        title: "Elon Musk Announces New AI Research Division",
        summary: "Tesla is forming an AI research division to advance autonomous driving.",
        content: "The new division will focus on developing next-generation AI systems for Full Self-Driving (FSD) and robotics.",
        source: "TechCrunch",
        sentiment_score: 0.44,
        published_date: "2024-05-29"
    },

    // ----------- AMZN -----------
    {
        symbol: "AMZN",
        title: "Amazon Prime Day Breaks Sales Records",
        summary: "Prime Day 2024 was the largest shopping event in Amazon's history.",
        content: "Amazon reported over $13 billion in sales during its 2024 Prime Day event, with electronics and home goods leading the surge.",
        source: "CNBC",
        sentiment_score: 0.63,
        published_date: "2024-07-13"
    },
    {
        symbol: "AMZN",
        title: "Amazon Expands Healthcare Services",
        summary: "Amazon announced the launch of virtual healthcare for Prime members.",
        content: "The new service provides virtual doctor consultations and prescription delivery in select US cities, as Amazon seeks to disrupt healthcare.",
        source: "Reuters",
        sentiment_score: 0.50,
        published_date: "2024-06-02"
    },
    {
        symbol: "AMZN",
        title: "Amazon Faces Warehouse Labor Strike",
        summary: "Workers at a major Amazon fulfillment center went on strike.",
        content: "The strike, centered on working conditions and pay, could disrupt Amazon's supply chain ahead of the holiday shopping season.",
        source: "The Wall Street Journal",
        sentiment_score: -0.36,
        published_date: "2024-04-14"
    },
    {
        symbol: "AMZN",
        title: "Amazon Invests in Renewable Energy",
        summary: "Amazon to build new solar and wind farms in Europe.",
        content: "Amazon's investment will support its goal of becoming carbon-neutral by 2040 and expand its clean energy footprint.",
        source: "Bloomberg",
        sentiment_score: 0.47,
        published_date: "2024-05-23"
    },
    {
        symbol: "AMZN",
        title: "Amazon Launches AI-Powered Shopping Assistant",
        summary: "Amazon's new AI assistant helps customers find deals and compare products.",
        content: "The assistant uses generative AI to answer questions and provide personalized shopping recommendations.",
        source: "TechCrunch",
        sentiment_score: 0.55,
        published_date: "2024-03-19"
    },

    // ----------- NVDA -----------
    {
        symbol: "NVDA",
        title: "Nvidia Launches Next-Gen AI GPUs",
        summary: "Nvidia unveils new GPU architecture aimed at AI workloads.",
        content: "The new chips, codenamed Blackwell, are designed for generative AI and data center markets, promising major performance improvements.",
        source: "Bloomberg",
        sentiment_score: 0.69,
        published_date: "2024-05-08"
    },
    {
        symbol: "NVDA",
        title: "Nvidia Reports Record Quarterly Earnings",
        summary: "Nvidia's Q2 2024 earnings exceeded Wall Street expectations.",
        content: "Driven by strong demand for AI chips, Nvidia's revenue rose 38% year-over-year, solidifying its leadership in AI hardware.",
        source: "Reuters",
        sentiment_score: 0.60,
        published_date: "2024-06-28"
    },
    {
        symbol: "NVDA",
        title: "Nvidia Faces US Export Restrictions",
        summary: "New US rules limit Nvidia's chip exports to China.",
        content: "Nvidia must halt sales of high-end GPUs to China, which may impact future growth in the region.",
        source: "The Wall Street Journal",
        sentiment_score: -0.49,
        published_date: "2024-07-07"
    },
    {
        symbol: "NVDA",
        title: "Nvidia Partners with Tesla for Autonomous Driving",
        summary: "Nvidia and Tesla deepen collaboration on AI chips.",
        content: "Nvidia announced a strategic partnership with Tesla to supply next-gen chips for Full Self-Driving systems.",
        source: "TechCrunch",
        sentiment_score: 0.42,
        published_date: "2024-04-20"
    },
    {
        symbol: "NVDA",
        title: "Nvidia Expands R&D in Israel",
        summary: "Nvidia to open new AI research center in Tel Aviv.",
        content: "The company plans to invest $100 million in R&D to accelerate AI innovation in computer vision and robotics.",
        source: "Yahoo Finance",
        sentiment_score: 0.38,
        published_date: "2024-03-16"
    },

    // ----------- META -----------
    {
        symbol: "META",
        title: "Meta Launches New AR Glasses",
        summary: "Meta's smart glasses get an upgrade with new AR features.",
        content: "The second-generation glasses include improved displays, hands-free controls, and integration with Meta's AI assistant.",
        source: "The Verge",
        sentiment_score: 0.53,
        published_date: "2024-05-20"
    },
    {
        symbol: "META",
        title: "Meta Reports User Growth on Threads App",
        summary: "Meta's Threads app hits 150 million active users.",
        content: "Threads, Meta's microblogging platform, continues to gain traction as users seek alternatives to Twitter/X.",
        source: "Reuters",
        sentiment_score: 0.44,
        published_date: "2024-07-06"
    },
    {
        symbol: "META",
        title: "Meta Faces Lawsuit Over Data Privacy",
        summary: "A class-action lawsuit alleges Meta mishandled user data.",
        content: "The suit claims Meta failed to protect sensitive user information in its family of apps, raising concerns about data privacy.",
        source: "Financial Times",
        sentiment_score: -0.42,
        published_date: "2024-06-13"
    },
    {
        symbol: "META",
        title: "Meta Expands Metaverse Partnerships",
        summary: "Meta collaborates with game studios for metaverse content.",
        content: "New partnerships aim to bring exclusive games and social experiences to Meta's VR and AR platforms.",
        source: "TechCrunch",
        sentiment_score: 0.36,
        published_date: "2024-03-27"
    },
    {
        symbol: "META",
        title: "Meta Announces Stock Buyback Plan",
        summary: "Meta to repurchase $40 billion in shares.",
        content: "The buyback reflects confidence in Meta's long-term prospects despite market volatility.",
        source: "Yahoo Finance",
        sentiment_score: 0.41,
        published_date: "2024-04-12"
    },

    // ----------- NFLX -----------
    {
        symbol: "NFLX",
        title: "Netflix Reports Subscriber Growth",
        summary: "Netflix added 8 million new subscribers in Q2 2024.",
        content: "Strong performance in Asia and Latin America drove overall subscriber numbers higher, boosting Netflix's share price.",
        source: "Bloomberg",
        sentiment_score: 0.52,
        published_date: "2024-07-14"
    },
    {
        symbol: "NFLX",
        title: "Netflix Launches Ad-Supported Tier",
        summary: "New subscription option aims to attract price-sensitive customers.",
        content: "The ad-supported tier is expected to boost revenue and increase global subscriber growth.",
        source: "Reuters",
        sentiment_score: 0.48,
        published_date: "2024-05-09"
    },
    {
        symbol: "NFLX",
        title: "Netflix Invests in Original Korean Content",
        summary: "Netflix to produce 15 new Korean dramas and films in 2024.",
        content: "The investment builds on the global success of shows like 'Squid Game' and reflects Netflix's strategy to grow in Asia.",
        source: "TechCrunch",
        sentiment_score: 0.45,
        published_date: "2024-03-18"
    },
    {
        symbol: "NFLX",
        title: "Netflix Faces Competition from Disney+",
        summary: "Disney+ continues to gain market share in the streaming wars.",
        content: "Netflix is responding with exclusive content deals and global expansion to fend off competition.",
        source: "CNBC",
        sentiment_score: -0.33,
        published_date: "2024-04-21"
    },
    {
        symbol: "NFLX",
        title: "Netflix Announces Price Increase",
        summary: "Subscription prices to rise for US and UK customers.",
        content: "The company cited rising content production costs and investments in new technology as reasons for the increase.",
        source: "Financial Times",
        sentiment_score: -0.22,
        published_date: "2024-06-25"
    }
];

async function insertNews() {
    const db = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'stock_simulator',
    });

    let inserted = 0;
    let skipped = 0;
    let failed = 0;

    for (const news of newsData) {
        const { symbol, title, summary, content, source, sentiment_score, published_date } = news;

        try {
            // ✅ 查询是否已存在
            const [existing] = await db.execute(
                `SELECT 1 FROM news WHERE symbol = ? AND title = ? AND published_date = ? LIMIT 1`,
                [symbol, title, published_date]
            );

            if (existing.length > 0) {
                console.log(`🟡 已存在，跳过: ${symbol} ${published_date} ${title.slice(0, 20)}...`);
                skipped++;
                continue;
            }

            // ✅ 执行插入
            await db.execute(
                `INSERT INTO news (symbol, title, summary, content, source, sentiment_score, published_date)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [symbol, title, summary, content, source, sentiment_score, published_date]
            );
            console.log(`🟢 写入成功: ${symbol} ${published_date} ${title.slice(0, 20)}...`);
            inserted++;
        } catch (err) {
            console.error(`🔴 插入失败: ${symbol} ${published_date} - ${err.message}`);
            failed++;
        }
    }

    await db.end();

    console.log('\n📊 插入完成：');
    console.log(`✅ 成功插入: ${inserted}`);
    console.log(`🟡 跳过重复: ${skipped}`);
    console.log(`🔴 插入失败: ${failed}`);
}

// 启动主函数
insertNews().catch(e => {
    console.error('Fatal error:', e);
});