import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // 更新 state 使下一次渲染能够显示降级后的 UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // 你同样可以将错误日志上报给服务器
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // 你可以自定义降级后的 UI 并渲染
            return (
                <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    margin: '20px'
                }}>
                    <h2 style={{ color: '#dc3545' }}>⚠️ Something went wrong</h2>
                    <p>An error occurred while rendering this component.</p>
                    <details style={{
                        marginTop: '10px',
                        textAlign: 'left',
                        backgroundColor: '#fff',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}>
                        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                            Error Details
                        </summary>
                        <pre style={{
                            fontSize: '12px',
                            overflow: 'auto',
                            marginTop: '10px',
                            padding: '10px',
                            backgroundColor: '#f8f9fa'
                        }}>
                            {this.state.error?.toString()}
                        </pre>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '15px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
