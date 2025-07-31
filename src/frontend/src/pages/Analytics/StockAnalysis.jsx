import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { analyticsApi } from '../../api/analyticsApi';

const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState('');

  // 动态生成AI分析prompt
  const generatePromptFromData = (data) => {
    if (!data) return "Please analyze my stock portfolio and provide investment suggestions.";
    const {
      totalValue,
      totalReturn,
      returnPercentage,
      dailyReturns,
      topPerformers,
      worstPerformers,
      assetDistribution,
      maxDrawdown,
      sharpeRatio,
      winRate,
      benchmark
    } = data;
    return `
My portfolio data:
Total Assets: $${totalValue}
Total Return: $${totalReturn} (Return Rate: ${returnPercentage?.toFixed(2) || '--'}%)
Max Drawdown: ${maxDrawdown ? maxDrawdown.toFixed(2) : '--'}%
Sharpe Ratio: ${sharpeRatio ? sharpeRatio.toFixed(2) : '--'}
Win Rate: ${winRate ? winRate.toFixed(2) : '--'}%
Benchmark Comparison: Portfolio ${benchmark?.portfolioReturn || '--'}%, Benchmark ${benchmark?.benchmarkReturn || '--'}%, Relative ${benchmark?.relativePerformance || '--'}%

Recent Daily Returns:
${Array.isArray(dailyReturns) ? dailyReturns.map(d => `${d.date}: $${d.value}`).join('\n') : '--'}

Top Performers:
${Array.isArray(topPerformers) ? topPerformers.map(s => `${s.symbol}: $${s.value || '--'}`).join('\n') : '--'}

Worst Performers:
${Array.isArray(worstPerformers) ? worstPerformers.map(s => `${s.symbol}: $${s.value || '--'}`).join('\n') : '--'}

Asset Distribution:
${Array.isArray(assetDistribution) ? assetDistribution.map(a => `${a.symbol}: ${a.percent || '--'}%`).join('\n') : '--'}

Please analyze my stock portfolio and provide investment suggestions, including: 1. Asset structure analysis; 2. Performance evaluation; 3. Risk points; 4. Specific operation advice (buy/add, sell/reduce, hold); 5. Industry trend forecast. Present in a clear structure for frontend display.
`.trim();
  };

  // Call API to get stock analysis and suggestions
  const fetchStockAnalysis = async () => {
    try {
      setLoading(true);
      // 先从后端获取投资组合分析数据
      const analyticsData = await analyticsApi.getPortfolioAnalytics();
      const promptText = generatePromptFromData(analyticsData);
      const url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 45f22677-b471-4784-a35b-cb902b0d62de"
        },
        body: JSON.stringify({
          "model": "doubao-seed-1-6-250615",
          "messages": [
            {
              "content": [
                {
                  "text": promptText,
                  "type": "text"
                }
              ],
              "role": "user"
            }
          ]
        })
      });
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      const apiResult = await response.json();
      const content = apiResult.choices?.[0]?.message?.content || 'Analysis content not obtained';
      setRawResponse(content);
      setAnalysis(formatAnalysis(content));
      setLoading(false);
    } catch (err) {
      setError(`Failed to get stock analysis: ${err.message}`);
      setLoading(false);
      console.error("Stock analysis API call error:", err);
    }
  };

  // Format analysis content to structured data
  const formatAnalysis = (content) => {
    // 简单分割处理，实际可根据API返回格式优化
    const sections = content.split(/###|\n##/).filter(section => section.trim());
    
    return {
      fullText: content,
      sections: sections.map(section => {
        const titleMatch = section.match(/^[^\n]+/);
        const title = titleMatch ? titleMatch[0].trim() : 'Analysis Section';
        const content = section.replace(title, '').trim();
        
        return { title, content };
      })
    };
  };

  useEffect(() => {
    fetchStockAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <p>Getting stock analysis and suggestions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics-page">
        <div className="error-state">
          <p>{error}</p>
          {rawResponse && (
            <div className="raw-response">
              <p>API原始响应:</p>
              <pre>{rawResponse}</pre>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Stock Analysis & Investment Suggestions</h1>
        <p>Professional analysis based on market data</p>
      </div>

      {/* 调试用原始响应 */}
      <div className="debug-section" style={{margin: '10px 0', padding: '10px', backgroundColor: '#f5f5f5'}}>
        <details>
          <summary>查看API原始响应</summary>
          <pre style={{whiteSpace: 'pre-wrap'}}>{rawResponse}</pre>
        </details>
      </div>

      <div className="analysis-content">
        {analysis?.sections?.map((section, index) => (
          <div key={index} className="analysis-section">
            <h2>{section.title}</h2>
            <div className="analysis-text">
              {section.content.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons" style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
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
          Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default StockAnalysis;
    