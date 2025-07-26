// 合并后的认证页面 - 包含登录和注册
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth, useLoginForm, useRegisterForm } from '../../hooks';
import { getErrorMessage } from '../../utils/formatters';
import './Auth.css';

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  // 登录处理
  const handleLoginSubmitAction = async (formData) => {
    try {
      const result = await login(formData);
      if (result.success) {
        navigate('/stocks');
      } else {
        throw new Error(result.error || '登录失败');
      }
    } catch (err) {
      setLoginFormErrors({ submit: getErrorMessage(err) });
    }
  };

  // 注册处理
  const handleRegisterSubmitAction = async (formData) => {
    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      if (response.success) {
        setIsLogin(true); // 注册成功后切换到登录
        alert('注册成功，请登录');
      } else {
        throw new Error(response.error || '注册失败');
      }
    } catch (err) {
      setRegisterFormErrors({ submit: getErrorMessage(err) });
    }
  };

  // 登录表单
  const {
    values: loginValues,
    errors: loginErrors,
    isSubmitting: loginSubmitting,
    handleChange: handleLoginChange,
    handleBlur: handleLoginBlur,
    handleSubmit: handleLoginSubmit,
    setFormErrors: setLoginFormErrors
  } = useLoginForm(handleLoginSubmitAction);

  // 注册表单
  const {
    values: registerValues,
    errors: registerErrors,
    isSubmitting: registerSubmitting,
    handleChange: handleRegisterChange,
    handleBlur: handleRegisterBlur,
    handleSubmit: handleRegisterSubmit,
    setFormErrors: setRegisterFormErrors
  } = useRegisterForm(handleRegisterSubmitAction);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* 切换标签 */}
        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            登录
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            注册
          </button>
        </div>

        {isLogin ? (
          // 登录表单
          <>
            <div className="auth-header">
              <h2>📈 登录</h2>
              <p>欢迎回到股票交易模拟器</p>
            </div>

            {loginErrors.submit && (
              <div className="error-message">❌ {loginErrors.submit}</div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">用户名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={loginValues.username}
                  onChange={handleLoginChange}
                  onBlur={handleLoginBlur}
                  required
                  disabled={loginSubmitting}
                />
                {loginErrors.username && (
                  <div className="field-error">{loginErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">密码</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginValues.password}
                  onChange={handleLoginChange}
                  onBlur={handleLoginBlur}
                  required
                  disabled={loginSubmitting}
                />
                {loginErrors.password && (
                  <div className="field-error">{loginErrors.password}</div>
                )}
              </div>

              <button type="submit" className="auth-button" disabled={loginSubmitting}>
                {loginSubmitting ? '登录中...' : '登录'}
              </button>
            </form>
          </>
        ) : (
          // 注册表单
          <>
            <div className="auth-header">
              <h2>📊 注册</h2>
              <p>创建您的股票交易模拟账户</p>
            </div>

            {registerErrors.submit && (
              <div className="error-message">❌ {registerErrors.submit}</div>
            )}

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">用户名 *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={registerValues.username}
                  onChange={handleRegisterChange}
                  onBlur={handleRegisterBlur}
                  required
                  disabled={registerSubmitting}
                  minLength={3}
                />
                {registerErrors.username && (
                  <div className="field-error">{registerErrors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">邮箱 *</label>
                <input
                  type="email"
                  id="reg-email"
                  name="email"
                  value={registerValues.email}
                  onChange={handleRegisterChange}
                  onBlur={handleRegisterBlur}
                  required
                  disabled={registerSubmitting}
                />
                {registerErrors.email && (
                  <div className="field-error">{registerErrors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">密码 *</label>
                <input
                  type="password"
                  id="reg-password"
                  name="password"
                  value={registerValues.password}
                  onChange={handleRegisterChange}
                  onBlur={handleRegisterBlur}
                  required
                  disabled={registerSubmitting}
                  minLength={6}
                />
                {registerErrors.password && (
                  <div className="field-error">{registerErrors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码 *</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={registerValues.confirmPassword}
                  onChange={handleRegisterChange}
                  onBlur={handleRegisterBlur}
                  required
                  disabled={registerSubmitting}
                />
                {registerErrors.confirmPassword && (
                  <div className="field-error">{registerErrors.confirmPassword}</div>
                )}
              </div>

              <button type="submit" className="auth-button" disabled={registerSubmitting}>
                {registerSubmitting ? '注册中...' : '创建账户'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <Link to="/" className="auth-link">返回首页</Link>
        </div>
      </div>
    </div>
  );
}

export default Auth;
