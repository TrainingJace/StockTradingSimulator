// 股票详细信息测试数据
export const stockDetailData = {
  'AAPL': {
    logo: 'https://logo.clearbit.com/apple.com',
    description: 'Apple Inc. is an American multinational technology company that specializes in consumer electronics, computer software, and online services. Apple is one of the world\'s largest technology companies, known for its innovative products and ecosystem.',
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
  'AMZN': {
    logo: 'https://logo.clearbit.com/amazon.com',
    description: 'Amazon.com, Inc.是一家美国跨国科技公司，专注于电子商务、云计算、数字流媒体和人工智能。亚马逊是全球最大的电商平台之一，AWS是领先的云服务提供商。',
    news: [
      {
        id: 1,
        title: 'Amazon AWS收入增长超预期',
        summary: 'Amazon Web Services部门收入同比增长20%，云计算业务持续强劲增长...',
        date: '2024-01-25',
        source: 'Reuters'
      },
      {
        id: 2,
        title: 'Amazon Prime会员数突破2亿',
        summary: 'Amazon宣布全球Prime会员数量达到2亿，会员服务收入创新高...',
        date: '2024-01-24',
        source: 'TechCrunch'
      },
      {
        id: 3,
        title: 'Amazon投资人工智能初创公司',
        summary: 'Amazon通过其投资基金向多家AI初创公司投资，加强技术布局...',
        date: '2024-01-23',
        source: 'VentureBeat'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 143.20, high: 145.60, low: 142.50, close: 145.60, volume: 35000000 },
        { time: '2024-01-21', open: 145.60, high: 147.20, low: 144.80, close: 146.50, volume: 38000000 },
        { time: '2024-01-22', open: 146.50, high: 148.90, low: 145.70, close: 147.80, volume: 36000000 },
        { time: '2024-01-23', open: 147.80, high: 150.20, low: 147.20, close: 149.60, volume: 33000000 },
        { time: '2024-01-24', open: 149.60, high: 151.80, low: 148.90, close: 150.90, volume: 37000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 140.50, high: 145.60, low: 139.80, close: 145.60, volume: 175000000 },
        { time: '2024-01-22', open: 145.60, high: 151.80, low: 144.80, close: 150.90, volume: 182000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 135.20, high: 145.60, low: 132.50, close: 145.60, volume: 750000000 },
        { time: '2024-01-01', open: 145.60, high: 155.90, low: 139.80, close: 150.90, volume: 780000000 }
      ]
    }
  },
  'NVDA': {
    logo: 'https://logo.clearbit.com/nvidia.com',
    description: 'NVIDIA Corporation是一家美国跨国科技公司，专门设计图形处理器(GPU)、片上系统(SoC)和相关多媒体软件。在人工智能和机器学习硬件领域处于领先地位。',
    news: [
      {
        id: 1,
        title: 'NVIDIA发布新一代AI芯片',
        summary: 'NVIDIA推出最新的H100 GPU，专为大规模AI训练和推理设计...',
        date: '2024-01-25',
        source: 'AnandTech'
      },
      {
        id: 2,
        title: 'NVIDIA与汽车厂商合作扩大',
        summary: 'NVIDIA宣布与多家汽车制造商签署自动驾驶技术合作协议...',
        date: '2024-01-24',
        source: 'Automotive News'
      },
      {
        id: 3,
        title: 'NVIDIA数据中心收入创纪录',
        summary: 'NVIDIA数据中心业务收入同比增长400%，AI需求推动增长...',
        date: '2024-01-23',
        source: 'Semiconductor Digest'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 885.20, high: 892.50, low: 880.30, close: 892.50, volume: 18000000 },
        { time: '2024-01-21', open: 892.50, high: 905.80, low: 890.20, close: 898.70, volume: 22000000 },
        { time: '2024-01-22', open: 898.70, high: 910.50, low: 895.40, close: 906.20, volume: 20000000 },
        { time: '2024-01-23', open: 906.20, high: 918.90, low: 903.50, close: 915.60, volume: 19000000 },
        { time: '2024-01-24', open: 915.60, high: 925.40, low: 912.80, close: 922.30, volume: 21000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 875.50, high: 892.50, low: 870.20, close: 892.50, volume: 95000000 },
        { time: '2024-01-22', open: 892.50, high: 925.40, low: 890.20, close: 922.30, volume: 102000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 820.60, high: 892.50, low: 810.20, close: 892.50, volume: 420000000 },
        { time: '2024-01-01', open: 892.50, high: 950.80, low: 870.20, close: 922.30, volume: 440000000 }
      ]
    }
  },
  'META': {
    logo: 'https://logo.clearbit.com/meta.com',
    description: 'Meta Platforms, Inc.是一家美国跨国科技集团，拥有Facebook、Instagram、WhatsApp等社交媒体平台。公司专注于构建元宇宙和社交连接技术。',
    news: [
      {
        id: 1,
        title: 'Meta元宇宙投资显成效',
        summary: 'Meta的Reality Labs部门在VR/AR技术方面取得重大突破...',
        date: '2024-01-25',
        source: 'The Information'
      },
      {
        id: 2,
        title: 'Meta广告收入强劲增长',
        summary: 'Meta公布广告收入同比增长25%，用户参与度持续提升...',
        date: '2024-01-24',
        source: 'Ad Age'
      },
      {
        id: 3,
        title: 'Meta推出新AI助手功能',
        summary: 'Meta在其平台上集成先进的AI助手，提升用户体验...',
        date: '2024-01-23',
        source: 'Social Media Today'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 330.15, high: 335.80, low: 325.40, close: 325.40, volume: 14000000 },
        { time: '2024-01-21', open: 325.40, high: 328.90, low: 322.50, close: 327.60, volume: 16000000 },
        { time: '2024-01-22', open: 327.60, high: 332.20, low: 326.80, close: 330.90, volume: 15000000 },
        { time: '2024-01-23', open: 330.90, high: 335.50, low: 329.70, close: 333.80, volume: 13000000 },
        { time: '2024-01-24', open: 333.80, high: 338.60, low: 332.40, close: 336.50, volume: 17000000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 335.90, high: 340.20, low: 325.40, close: 325.40, volume: 75000000 },
        { time: '2024-01-22', open: 325.40, high: 338.60, low: 322.50, close: 336.50, volume: 78000000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 315.80, high: 340.20, low: 310.50, close: 325.40, volume: 330000000 },
        { time: '2024-01-01', open: 325.40, high: 350.90, low: 322.50, close: 336.50, volume: 345000000 }
      ]
    }
  },
  'NFLX': {
    logo: 'https://logo.clearbit.com/netflix.com',
    description: 'Netflix, Inc.是一家美国流媒体娱乐服务公司，提供电视剧、电影和纪录片的在线流媒体播放服务。在全球流媒体市场占据领导地位。',
    news: [
      {
        id: 1,
        title: 'Netflix全球订阅用户突破2.5亿',
        summary: 'Netflix公布全球付费订阅用户数达到2.5亿，超出分析师预期...',
        date: '2024-01-25',
        source: 'Variety'
      },
      {
        id: 2,
        title: 'Netflix原创内容投资增加',
        summary: 'Netflix宣布2024年将在原创内容上投资200亿美元...',
        date: '2024-01-24',
        source: 'Hollywood Reporter'
      },
      {
        id: 3,
        title: 'Netflix进军游戏市场',
        summary: 'Netflix扩展其游戏业务，推出多款移动游戏供订阅用户免费游玩...',
        date: '2024-01-23',
        source: 'GameSpot'
      }
    ],
    chartData: {
      daily: [
        { time: '2024-01-20', open: 480.90, high: 487.30, low: 478.20, close: 487.30, volume: 3200000 },
        { time: '2024-01-21', open: 487.30, high: 495.60, low: 485.80, close: 492.40, volume: 3800000 },
        { time: '2024-01-22', open: 492.40, high: 498.70, low: 490.50, close: 496.80, volume: 3500000 },
        { time: '2024-01-23', open: 496.80, high: 502.90, low: 494.60, close: 500.20, volume: 3300000 },
        { time: '2024-01-24', open: 500.20, high: 506.50, low: 498.90, close: 504.60, volume: 3600000 }
      ],
      weekly: [
        { time: '2024-01-15', open: 475.20, high: 487.30, low: 472.80, close: 487.30, volume: 17500000 },
        { time: '2024-01-22', open: 487.30, high: 506.50, low: 485.80, close: 504.60, volume: 18200000 }
      ],
      monthly: [
        { time: '2023-12-01', open: 455.90, high: 487.30, low: 450.20, close: 487.30, volume: 75000000 },
        { time: '2024-01-01', open: 487.30, high: 515.80, low: 472.80, close: 504.60, volume: 78000000 }
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
