import React, { useState, useEffect } from 'react';
import './Analytics.css';

// mock 数据
const analyticsMockData = {
  totalValue: 120000,
  totalReturn: 15000,
  returnPercentage: 14.29,
  dailyReturns: [
    { date: '2025-07-21', value: 118000 },
    { date: '2025-07-22', value: 119000 },
    { date: '2025-07-23', value: 119500 },
    { date: '2025-07-24', value: 120000 },
  ],
  topPerformers: [
    { symbol: 'AAPL', change: 8.2 },
    { symbol: 'TSLA', change: 6.5 },
    { symbol: 'NVDA', change: 5.9 }
  ],
  worstPerformers: [
    { symbol: 'BABA', change: -4.1 },
    { symbol: 'PDD', change: -3.7 },
    { symbol: 'JD', change: -2.9 }
  ],
  assetDistribution: [
    { symbol: 'AAPL', percent: 35 },
    { symbol: 'TSLA', percent: 25 },
    { symbol: 'NVDA', percent: 20 },
    { symbol: 'BABA', percent: 10 },
    { symbol: 'JD', percent: 10 }
  ]
};

// 将结构化数据变为 prompt
const generatePromptFromData = (data) => {
  const {
    totalValue,
    totalReturn,
    returnPercentage,
    dailyReturns,
    topPerformers,
    worstPerformers,
    assetDistribution
  } = data;

  return `
以下是一个股票投资组合的结构化数据，请你根据这些数据撰写一段自然语言分析报告，内容包括：资产表现、收益趋势、优秀与表现差的个股、资产结构以及投资建议。尽量使用段落而非列表，语气专业但清晰。

【总资产】￥${totalValue}  
【总收益】￥${totalReturn}（收益率：${returnPercentage.toFixed(2)}%）

【近4日收益走势】：
${dailyReturns.map(d => `${d.date}: ￥${d.value}`).join('\n')}

【表现最好的个股】：
${topPerformers.map(s => `${s.symbol}: +${s.change}%`).join('\n')}

【表现最差的个股】：
${worstPerformers.map(s => `${s.symbol}: ${s.change}%`).join('\n')}

【资产分布】：
${assetDistribution.map(a => `${a.symbol}: ${a.percent}%`).join('\n')}

请根据以上数据，用自然语言输出一段股票投资分析报告，强调资产趋势、风险判断与操作建议,
格式需要好看一点,不要分太多点,还需要精简一些,大约300字。不要分析段落这几个字,直接给出分析内容.
  `.trim();
};

// 分析文本转为结构化展示用
const formatAnalysis = (content) => {
  const sections = content.split(/\n\s*\n/).filter(section => section.trim());
  return {
    fullText: content,
    sections: sections.map((section, index) => ({
      title: `分析段落 ${index + 1}`,
      content: section.trim()
    }))
  };
};

const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rawResponse, setRawResponse] = useState('');
  const [error, setError] = useState(null);

  // 调用豆包API，发送 prompt（基于结构化数据）
  const fetchStockAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);

      const promptText = generatePromptFromData(analyticsMockData);

      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 45f22677-b471-4784-a35b-cb902b0d62de" // 请换成你自己的 Token
        },
        body: JSON.stringify({
          model: "doubao-seed-1-6-250615",
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: promptText }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }

      const apiResult = await response.json();
      const content = apiResult.choices?.[0]?.message?.content || '未获取到分析内容';
      setRawResponse(content);
      setAnalysis(formatAnalysis(content));
      setLoading(false);
    } catch (err) {
      setError(`获取分析失败：${err.message}`);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <p>正在生成智能分析报告,大约需要8-10秒..</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>股票组合智能分析</h1>
        <p>基于结构化数据，由豆包AI自动生成</p>
      </div>

      {error && (
        <div className="error-state" style={{ color: 'red', marginBottom: '20px' }}>
          <p>{error}</p>
        </div>
      )}

      {/* 原始响应 debug */}
      <div className="debug-section" style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <details>
          <summary>查看原始AI返回</summary>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{rawResponse}</pre>
        </details>
      </div>

      {/* 分段展示分析 */}
      <div className="analysis-content">
        {analysis?.sections?.map((section, index) => (
          <div key={index} className="analysis-section">
            <h2>{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>

      {/* 刷新按钮 */}
      <div className="action-buttons" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button
          onClick={fetchStockAnalysis}
          style={{
            padding: '8px 16px',
            backgroundColor: '#36A2EB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          刷新分析
        </button>
      </div>
    </div>
  );
};

export default Analysis;
