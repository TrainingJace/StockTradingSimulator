const { authService } = require('../services');

// 认证中间件
const authenticateToken = async (req, res, next) => {
  try {
    const config = require('../config');
    // 如果JWT_SECRET为默认值，则跳过鉴权
    if (config.auth.jwtSecret === 'your-super-secret-jwt-key-change-this-in-production') {
      req.user = { userId: 0, username: 'dev', email: 'dev@example.com', devMode: true };
      return next();
    }

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = authService.verifyToken(token);

    // 验证用户是否仍然存在
    const user = await authService.getUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// 可选认证中间件（用于可选登录的路由）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = authService.verifyToken(token);
        const user = await authService.getUserById(decoded.userId);
        if (user) {
          req.user = decoded;
        }
      } catch (error) {
        // 忽略token错误，继续执行
        console.log('Optional auth failed:', error.message);
      }
    }
    
    next();
  } catch (error) {
    // 可选认证失败时不阻止请求
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};
