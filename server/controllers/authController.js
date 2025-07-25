const userService = require('../services/userService.real');

class AuthController {
  // 用户注册
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const user = await userService.createUser({ username, password, email });
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // 用户登录
  async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      // 验证用户凭据
      const user = await userService.validateCredentials(username, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // 生成 JWT token
      const token = await userService.generateToken(user);
      
      res.json({
        success: true,
        data: {
          user: user,
          token: token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  }

  // 验证token
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = userService.verifyToken(token);
      const user = await userService.getUserById(decoded.userId);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user, decoded },
        message: 'Token is valid'
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const user = await userService.getUserById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // 更新用户模拟日期
  async updateCurrentDate(req, res) {
    try {
      const { newDate } = req.body;
      const userId = req.user.userId;
      
      if (!newDate) {
        return res.status(400).json({
          success: false,
          error: 'New date is required'
        });
      }

      const user = await userService.updateCurrentDate(userId, newDate);
      
      res.json({
        success: true,
        data: user,
        message: 'Current date updated successfully'
      });
    } catch (error) {
      console.error('Update current date error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
