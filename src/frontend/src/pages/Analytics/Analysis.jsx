import React, { useState, useEffect } from 'react';
import './Analytics.css';
import { analyticsApi } from '../../api/analyticsApi';
import { authApi } from '../../api/authApi';

// 将结构化数据转为 prompt
const generatePromptFromData = (data) => {
  const {
    totalValue = 0,
    totalReturn = 0,
    returnPercentage = 0,
    dailyReturns = [],
    topPerformers = [],
    worstPerformers = [],
    assetDistribution = []
  } = data;

  // 确保 returnPercentage 是数字类型
  const returnPercentageFormatted = typeof returnPercentage === 'number' ? returnPercentage : parseFloat(returnPercentage) || 0;

  return `
以下是一个股票投资组合的结构化数据，请你根据这些数据撰写一段自然语言分析报告，内容包括：资产表现、收益趋势、优秀与表现差的个股、资产结构以及投资建议。
尽量使用段落而非列表，语气专业但清晰,要给纯英文。

【总资产】$${totalValue}
【总收益】$${totalReturn}（收益率：${returnPercentageFormatted.toFixed(2)}%）

【近期收益走势】：
${dailyReturns?.map(d => `${d.date}: $${d.value}`).join('\n') || 'No data'}

【表现最好的个股】：
${topPerformers?.map(s => `${s.symbol}: +${s.change}%`).join('\n') || 'No data'}

【表现最差的个股】：
${worstPerformers?.map(s => `${s.symbol}: ${s.change}%`).join('\n') || 'No data'}

【资产分布】：
${assetDistribution?.map(a => `${a.symbol}: ${a.percent}%`).join('\n') || 'No data'}

请根据以上数据，用自然语言输出一段股票投资分析报告，强调资产趋势、风险判断与操作建议,
格式需要好看一点,不要分太多点,还需要精简一些,大约300字。不要分析段落这几个字,直接给出分析内容.
内容中不要出現日期、时间等字眼,直接给出分析内容.給出的金錢符號是美元的
  `.trim();
};

const Analysis = ({ analyticsData = {} }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('Analysis my portfolio now');
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isCustomSearch, setIsCustomSearch] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [currentAnalyticsData, setCurrentAnalyticsData] = useState({});

  // 获取分析数据
  const fetchAnalyticsData = async () => {
    try {
      const user = await authApi.getCurrentUser();
      if (!user || !user.data) {
        throw new Error('No user data found');
      }

      const data = await analyticsApi.getPortfolioAnalytics();
      setCurrentAnalyticsData(data);
      return data;
    } catch (err) {
      setError(`Failed to load portfolio data: ${err.message}`);
      return {};
    }
  };

  // 调用AI API，发送默认分析
  const fetchStockAnalysis = async (dataToUse = null) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      setIsCustomSearch(false);

      const interval = setInterval(() => {
        setProgress(prev => prev < 90 ? prev + 10 : prev);
      }, 1000);

      let dataForPrompt = dataToUse || currentAnalyticsData || analyticsData;
      
      if (!dataForPrompt || Object.keys(dataForPrompt).length === 0) {
        dataForPrompt = await fetchAnalyticsData();
      }

      const promptText = generatePromptFromData(dataForPrompt);

      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 10da0b38-73d5-4901-9b66-cfa4a3b650b8"
        },
        body: JSON.stringify({
          model: "kimi-k2-250711",
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: promptText }]
            }
          ]
        })
      });

      if (!response.ok) {
        clearInterval(interval);
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiResult = await response.json();
      const content = apiResult.choices?.[0]?.message?.content || 'Analysis content not obtained';

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setAnalysis(content);
        setLoading(false);
        setProgress(0);
      }, 500);

    } catch (err) {
      setError(err.message);
      setLoading(false);
      setProgress(0);
    }
  };

  // 处理用户自定义搜索
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter your query');
      return;
    }

    try {
      setSearchLoading(true);
      setError(null);
      setIsCustomSearch(true);
      setHasUserInteracted(true);
      
      // 获取当前投资组合数据用于上下文
      let contextData = currentAnalyticsData || analyticsData;
      if (!contextData || Object.keys(contextData).length === 0) {
        contextData = await fetchAnalyticsData();
      }
      
      // 构建包含用户投资组合信息的提示词
      const contextPrompt = `
Based on the user's current portfolio data:
- Total Portfolio Value: $${contextData.totalValue || 0}
- Total Return: $${contextData.totalReturn || 0} (${contextData.returnPercentage || 0}%)
- Current Holdings: ${contextData.assetDistribution?.map(asset => `${asset.symbol} (${asset.percent}%)`).join(', ') || 'No holdings'}
- Recent Performance: ${contextData.dailyReturns?.length > 0 ? 'Available' : 'No data'}

User Question: ${searchQuery}

Please provide a personalized analysis and actionable advice based on their specific portfolio situation. Focus on:
1. How this relates to their current holdings and performance
2. Specific actions they could take given their portfolio composition
3. Risk considerations based on their current diversification
4. Timing considerations based on their recent performance trends

Provide practical, actionable insights in about 300 words.`;
    
      const response = await fetch("https://ark.cn-beijing.volces.com/api/v3/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer 10da0b38-73d5-4901-9b66-cfa4a3b650b8"
        },
        body: JSON.stringify({
          model: "kimi-k2-250711",
          messages: [
            {
              role: "user",
              content: [{ 
                type: "text", 
                text: contextPrompt
              }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content || 'No results found';
      
      setAnalysis(content);
      
      if (!hasUserInteracted) {
        setSearchQuery('');
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 重新生成默认分析
  const handleRegenerate = () => {
    setIsCustomSearch(false);
    fetchStockAnalysis();
  };

  // 处理输入框变化
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setHasUserInteracted(true);
  };

  // 组件挂载时获取数据
  useEffect(() => {
    if (analyticsData && Object.keys(analyticsData).length > 0) {
      setCurrentAnalyticsData(analyticsData);
      fetchStockAnalysis(analyticsData);
    } else {
      fetchAnalyticsData().then(data => {
        if (data && Object.keys(data).length > 0) {
          fetchStockAnalysis(data);
        }
      });
    }
  }, []);

  // 监听传入数据的变化
  useEffect(() => {
    if (analyticsData && Object.keys(analyticsData).length > 0) {
      setCurrentAnalyticsData(analyticsData);
    }
  }, [analyticsData]);

  return (
    <div className="analytics-page">
      <div className="page-header">
        <h1>Intelligent analysis</h1>
        <p>Generated by AI, for reference only</p>
        
        {/* 搜索框 */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about your portfolio... (Press Enter to send)"
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                outline: 'none',
              }}
              disabled={searchLoading}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading || !searchQuery.trim()}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                backgroundColor: searchLoading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: searchLoading ? 'not-allowed' : 'pointer',
                minWidth: '80px'
              }}
            >
              {searchLoading ? 'Sending...' : 'Send'}
            </button>
            
            {isCustomSearch && (
              <button
                onClick={handleRegenerate}
                disabled={loading}
                style={{
                  padding: '12px 16px',
                  fontSize: '16px',
                  backgroundColor: loading ? '#ccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Default
              </button>
            )}
          </div>
          
          {/* 智能建议按钮 */}
          <div style={{ 
            marginTop: '15px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px' 
          }}>
            <span style={{ 
              color: '#666', 
              fontSize: '14px', 
              alignSelf: 'center',
              marginRight: '10px'
            }}>
              Quick questions:
            </span>
            {[
              'Should I rebalance my portfolio?',
              'What are my biggest risks right now?',
              'Which stocks should I consider selling?',
              'How can I improve diversification?',
              'Is this a good time to buy more?'
            ].map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  setSearchQuery(suggestion);
                  setHasUserInteracted(true);
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '13px',
                  backgroundColor: '#e9ecef',
                  color: '#495057',
                  border: '1px solid #dee2e6',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#007bff';
                  e.target.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#e9ecef';
                  e.target.style.color = '#495057';
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          color: '#c33'
        }}>
          <p>Error: {error}</p>
        </div>
      )}

      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '2rem'
        }}>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#ecf0f1',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '1rem'
          }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #3498db, #2ecc71)',
              transition: 'width 0.3s ease',
              width: `${progress}%`
            }}></div>
          </div>
          <p>Generating analysis... {progress}%</p>
        </div>
      )}

      {analysis && !loading && (
        <div style={{ marginTop: '2rem' }}>
          <h2 style={{
            color: '#2c3e50',
            fontSize: '1.8rem',
            marginBottom: '1rem',
            fontWeight: 600
          }}>
            {isCustomSearch ? 'Custom Analysis Result' : 'Portfolio Analysis Report'}
          </h2>
          <div style={{
            padding: '1.5rem',
            backgroundColor: '#fff',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            lineHeight: '1.8',
            fontSize: '1rem',
            color: '#333',
            whiteSpace: 'pre-wrap'
          }}>
            {analysis}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
