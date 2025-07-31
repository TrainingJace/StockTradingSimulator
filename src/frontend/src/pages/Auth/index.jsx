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
        throw new Error(result.error || 'Login failed');
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
        setIsLogin(true); // Switch to login after successful registration
        alert('Registration successful, please login');
      } else {
        throw new Error(response.error || 'Registration failed');
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
        {/* Switch Tabs */}
        <div className="auth-tabs">
          <button 
            className={`tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          // Login Form
          <>
            <div className="auth-header">
              <h2>📈 Login</h2>
              <p>Welcome back to Stock Pilot</p>
            </div>

            {loginErrors.submit && (
              <div className="error-message">❌ {loginErrors.submit}</div>
            )}

            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
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
                <label htmlFor="password">Password</label>
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
                {loginSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </>
        ) : (
          // 注册表单
          <>
            <div className="auth-header">
              <h2>📊 Register</h2>
              <p>Create your stock trading simulation account</p>
            </div>

            {registerErrors.submit && (
              <div className="error-message">❌ {registerErrors.submit}</div>
            )}

            <form onSubmit={handleRegisterSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
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
                <label htmlFor="reg-email">Email *</label>
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
                <label htmlFor="reg-password">Password *</label>
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
                <label htmlFor="confirmPassword">Confirm Password *</label>
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
                {registerSubmitting ? 'Registering...' : 'Create Account'}
              </button>
            </form>
          </>
        )}

        <div className="auth-footer">
          <Link to="/" className="auth-link">Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Auth;
