// 股票详细信息测试数据
export const stockDetailData = {
  'AAPL': {
    logo: 'https://logo.clearbit.com/apple.com',
    description: 'Apple Inc.是一家美国跨国科技公司，专门设计、开发和销售消费电子、计算机软件和在线服务。苹果是世界上最大的科技公司之一，以其创新的产品和生态系统而闻名。',
    news: [
      {
        id: 1,
        title: 'Apple发布最新季度财报，iPhone销量超预期',
        summary: 'Apple公布了强劲的季度业绩，iPhone销量和服务收入均超出分析师预期...',
        date: '2024-01-25',
        source: 'Reuters'
      },
      {
        id: 2,
        title: 'Apple Vision Pro预计明年上市',
        summary: 'Apple的混合现实头显设备Vision Pro将在2024年初正式发售...',
        date: '2024-01-24',
        source: 'Bloomberg'
      },
      {
        id: 3,
        title: 'Apple在印度市场份额持续增长',
        summary: 'Apple在印度智能手机市场的份额达到新高，得益于本地制造策略...',
        date: '2024-01-23',
        source: 'TechCrunch'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 173.50, high: 175.25, low: 172.80, close: 175.25, volume: 45000000 },
        { time: '2024-01-21', open: 175.25, high: 177.10, low: 174.90, close: 176.80, volume: 52000000 },
        { time: '2024-01-22', open: 176.80, high: 178.50, low: 175.20, close: 177.90, volume: 48000000 },
        { time: '2024-01-23', open: 177.90, high: 179.80, low: 177.10, close: 178.50, volume: 43000000 },
        { time: '2024-01-24', open: 178.50, high: 180.20, low: 177.80, close: 179.60, volume: 46000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 170.20, high: 175.25, low: 169.80, close: 175.25, volume: 225000000 },
        { time: '2024-01-22', open: 175.25, high: 180.20, low: 174.90, close: 179.60, volume: 235000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 165.80, high: 175.25, low: 160.50, close: 175.25, volume: 980000000 },
        { time: '2024-01-01', open: 175.25, high: 185.40, low: 169.80, close: 179.60, volume: 1050000000 }
      ]
    }
  },
  'GOOGL': {
    logo: 'https://logo.clearbit.com/google.com',
    description: 'Alphabet Inc.是Google的母公司，是一家美国跨国集团公司。主要业务包括互联网搜索、云计算、广告技术等，在人工智能和机器学习领域处于领先地位。',
    news: [
      {
        id: 1,
        title: 'Google推出新一代AI模型Gemini',
        summary: 'Google发布了最新的人工智能模型Gemini，在多项基准测试中表现优异...',
        date: '2024-01-25',
        source: 'The Verge'
      },
      {
        id: 2,
        title: 'YouTube广告收入持续增长',
        summary: 'Alphabet公布YouTube广告收入同比增长15%，显示数字广告市场复苏...',
        date: '2024-01-24',
        source: 'CNBC'
      },
      {
        id: 3,
        title: 'Google Cloud业务扩展到新兴市场',
        summary: 'Google Cloud宣布在东南亚和拉美地区新建数据中心，加强全球布局...',
        date: '2024-01-23',
        source: 'TechNews'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 140.20, high: 142.50, low: 139.80, close: 138.75, volume: 28000000 },
        { time: '2024-01-21', open: 138.75, high: 140.80, low: 137.20, close: 139.90, volume: 31000000 },
        { time: '2024-01-22', open: 139.90, high: 141.50, low: 138.50, close: 140.20, volume: 29000000 },
        { time: '2024-01-23', open: 140.20, high: 142.10, low: 139.80, close: 141.30, volume: 27000000 },
        { time: '2024-01-24', open: 141.30, high: 143.20, low: 140.90, close: 142.80, volume: 30000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 135.50, high: 142.50, low: 134.80, close: 138.75, volume: 145000000 },
        { time: '2024-01-22', open: 138.75, high: 143.20, low: 137.20, close: 142.80, volume: 146000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 128.90, high: 142.50, low: 125.20, close: 138.75, volume: 620000000 },
        { time: '2024-01-01', open: 138.75, high: 148.30, low: 134.80, close: 142.80, volume: 650000000 }
      ]
    }
  },
  'MSFT': {
    logo: 'https://logo.clearbit.com/microsoft.com',
    description: 'Microsoft Corporation是一家美国跨国科技公司，主要开发、制造、授权和销售计算机软件、消费电子产品和个人计算机服务。是云计算和人工智能领域的领导者。',
    news: [
      {
        id: 1,
        title: 'Microsoft Azure收入增长强劲',
        summary: 'Microsoft公布Azure云服务收入同比增长30%，继续在云计算市场保持领先...',
        date: '2024-01-25',
        source: 'Wall Street Journal'
      },
      {
        id: 2,
        title: 'Microsoft与OpenAI深化合作',
        summary: 'Microsoft宣布进一步投资OpenAI，加强在人工智能领域的合作...',
        date: '2024-01-24',
        source: 'Financial Times'
      },
      {
        id: 3,
        title: 'Teams用户数突破3亿',
        summary: 'Microsoft Teams月活跃用户数突破3亿，在企业协作软件市场份额继续扩大...',
        date: '2024-01-23',
        source: 'ZDNet'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 412.30, high: 415.80, low: 410.50, close: 415.80, volume: 22000000 },
        { time: '2024-01-21', open: 415.80, high: 418.90, low: 414.20, close: 417.60, volume: 24000000 },
        { time: '2024-01-22', open: 417.60, high: 420.50, low: 416.80, close: 419.20, volume: 23000000 },
        { time: '2024-01-23', open: 419.20, high: 422.80, low: 418.50, close: 421.40, volume: 21000000 },
        { time: '2024-01-24', open: 421.40, high: 424.20, low: 420.80, close: 423.50, volume: 25000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 408.90, high: 415.80, low: 406.20, close: 415.80, volume: 110000000 },
        { time: '2024-01-22', open: 415.80, high: 424.20, low: 414.20, close: 423.50, volume: 115000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 395.20, high: 415.80, low: 390.50, close: 415.80, volume: 470000000 },
        { time: '2024-01-01', open: 415.80, high: 430.90, low: 406.20, close: 423.50, volume: 485000000 }
      ]
    }
  },
  'TSLA': {
    logo: 'https://logo.clearbit.com/tesla.com',
    description: 'Tesla, Inc.是一家美国电动汽车和清洁能源公司，专注于电动汽车、能源存储和太阳能板的设计和制造。在电动汽车市场和自动驾驶技术方面处于领先地位。',
    news: [
      {
        id: 1,
        title: 'Tesla第四季度交付量创新高',
        summary: 'Tesla公布2023年第四季度车辆交付量达到48.4万辆，超出市场预期...',
        date: '2024-01-25',
        source: 'Electrek'
      },
      {
        id: 2,
        title: 'Tesla在中国市场份额持续增长',
        summary: 'Tesla在中国电动汽车市场的份额继续上升，Model Y成为最受欢迎车型...',
        date: '2024-01-24',
        source: 'Reuters'
      },
      {
        id: 3,
        title: 'Tesla超级充电网络对其他品牌开放',
        summary: 'Tesla宣布将逐步向其他电动汽车品牌开放其超级充电网络...',
        date: '2024-01-23',
        source: 'InsideEVs'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 255.75, high: 258.90, low: 248.50, close: 248.50, volume: 75000000 },
        { time: '2024-01-21', open: 248.50, high: 252.80, low: 245.20, close: 250.90, volume: 82000000 },
        { time: '2024-01-22', open: 250.90, high: 254.60, low: 249.80, close: 252.40, volume: 78000000 },
        { time: '2024-01-23', open: 252.40, high: 256.80, low: 251.20, close: 254.70, volume: 71000000 },
        { time: '2024-01-24', open: 254.70, high: 258.20, low: 253.50, close: 256.80, volume: 76000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 260.50, high: 265.80, low: 248.50, close: 248.50, volume: 385000000 },
        { time: '2024-01-22', open: 248.50, high: 258.20, low: 245.20, close: 256.80, volume: 383000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 240.80, high: 265.80, low: 235.20, close: 248.50, volume: 1650000000 },
        { time: '2024-01-01', open: 248.50, high: 275.90, low: 245.20, close: 256.80, volume: 1680000000 }
      ]
    }
  },
  'HSBC': {
    logo: 'https://logo.clearbit.com/hsbc.com',
    description: 'HSBC Holdings plc是一家英国跨国投资银行和金融服务公司，总部位于伦敦。是世界上最大的银行之一，在亚洲、欧洲、北美等地区提供广泛的金融服务。',
    news: [
      {
        id: 1,
        title: 'HSBC宣布亚洲业务重组计划',
        summary: 'HSBC宣布将重组其亚洲业务，专注于财富管理和企业银行业务...',
        date: '2024-01-25',
        source: 'Financial Times'
      },
      {
        id: 2,
        title: 'HSBC数字化转型取得进展',
        summary: 'HSBC在数字银行服务方面投资显著，客户数字化采用率持续提升...',
        date: '2024-01-24',
        source: 'Banking Technology'
      },
      {
        id: 3,
        title: 'HSBC绿色金融业务扩展',
        summary: 'HSBC承诺到2030年提供1万亿美元的可持续融资和投资...',
        date: '2024-01-23',
        source: 'ESG Today'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 42.10, high: 42.85, low: 41.80, close: 42.85, volume: 8500000 },
        { time: '2024-01-21', open: 42.85, high: 43.20, low: 42.50, close: 43.10, volume: 9200000 },
        { time: '2024-01-22', open: 43.10, high: 43.50, low: 42.90, close: 43.30, volume: 8800000 },
        { time: '2024-01-23', open: 43.30, high: 43.80, low: 43.10, close: 43.60, volume: 8600000 },
        { time: '2024-01-24', open: 43.60, high: 44.10, low: 43.40, close: 43.90, volume: 9100000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 41.50, high: 42.85, low: 41.20, close: 42.85, volume: 42500000 },
        { time: '2024-01-22', open: 42.85, high: 44.10, low: 42.50, close: 43.90, volume: 44200000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 40.20, high: 42.85, low: 39.80, close: 42.85, volume: 185000000 },
        { time: '2024-01-01', open: 42.85, high: 45.20, low: 41.20, close: 43.90, volume: 192000000 }
      ]
    }
  }
};

// 默认数据，适用于没有详细信息的股票
export const getDefaultStockDetail = (symbol, name) => ({
  logo: `https://via.placeholder.com/100x100/667eea/ffffff?text=${symbol}`,
  description: `${name}是一家在相关行业领域运营的公司。更多详细信息敬请期待。`,
  news: [
    {
      id: 1,
      title: `${symbol}股价波动分析`,
      summary: '市场分析师对该股票的最新走势进行了深入分析...',
      date: '2024-01-25',
      source: 'Market News'
    },
    {
      id: 2,
      title: `${symbol}业务发展更新`,
      summary: '公司最新业务发展情况和未来战略规划...',
      date: '2024-01-24',
      source: 'Business Wire'
    },
    {
      id: 3,
      title: `${symbol}财务表现分析`,
      summary: '最新财务数据显示公司运营状况良好...',
      date: '2024-01-23',
      source: 'Financial Review'
    }
  ],
  chartData: {
    daily: [],
    weekly: [],
    monthly: []
  }
});
