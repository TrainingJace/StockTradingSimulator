import React, { useState, useEffect } from 'react';
import './Analytics.css';

const Analysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rawResponse, setRawResponse] = useState('');

  // 调用API获取股票分析和建议
  const fetchStockAnalysis = async () => {
    try {
      setLoading(true);
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
                  "text": "请分析我的股票组合情况并提供投资建议，包括：1. 资产结构分析；2. 收益表现评估；3. 风险点提示；4. 具体操作建议（加仓/减仓/持有）；5. 行业趋势预测。请以清晰的结构呈现，便于前端展示。",
                  "type": "text"
                }
              ],
              "role": "user"
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
      
      // 转换为结构化数据便于展示
      setAnalysis(formatAnalysis(content));
      setLoading(false);
    } catch (err) {
      setError(`获取股票分析失败: ${err.message}`);
      setLoading(false);
      console.error("股票分析API调用错误:", err);
    }
  };

  // 格式化分析内容为结构化数据
  const formatAnalysis = (content) => {
    // 简单分割处理，实际可根据API返回格式优化
    const sections = content.split(/###|\n##/).filter(section => section.trim());
    
    return {
      fullText: content,
      sections: sections.map(section => {
        const titleMatch = section.match(/^[^\n]+/);
        const title = titleMatch ? titleMatch[0].trim() : '分析部分';
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
          <p>正在获取股票分析和建议...</p>
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
        <h1>股票分析与投资建议</h1>
        <p>基于市场数据的专业分析</p>
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
          刷新分析
        </button>
      </div>
    </div>
  );
};

export default StockAnalysis;
    