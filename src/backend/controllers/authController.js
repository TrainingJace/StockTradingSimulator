const { authService } = require('../services');

/**
 * 统一的认证和用户管理控制器
 * 合并了原来的 authController 和 userController 功能
 */
class AuthController {
  // ========== 认证相关功能 ==========
  
  /**
   * 用户注册
   */
  async register(req, res) {
    try {
      const { username, password, email } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: 'Username and password are required'
        });
      }

      const user = await authService.createUser({ username, password, email });
      
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

  /**
   * 用户登录
   */
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
      const user = await authService.validateCredentials(username, password);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid username or password'
        });
      }

      // 生成 JWT token
      const token = await authService.generateToken(user);
      
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

  /**
   * 验证token
   */
  async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = authService.verifyToken(token);
      const user = await authService.getUserById(decoded.userId);
      
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

  // ========== 用户管理功能 ==========

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req, res) {
    try {
      const user = await authService.getUserById(req.user.userId);
      
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

  /**
   * 根据用户ID获取用户信息
   */
  async getUserById(req, res) {
    try {
      const { userId } = req.params;
      const user = await authService.getUserById(userId);
      
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
      console.error('Error in getUserById:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  /**
   * 根据用户名获取用户信息
   */
  async getUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const user = await authService.getUserByUsername(username);
      
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
      console.error('Error in getUserByUsername:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  /**
   * 更新用户模拟日期
   */
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

      const user = await authService.updateCurrentDate(userId, newDate);
      
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

  /**
   * 更新用户余额
   */
  async updateBalance(req, res) {
    try {
      const { userId } = req.params;
      const { balance } = req.body;
      
      if (balance === undefined || balance < 0) {
        return res.status(400).json({ 
          success: false,
          error: 'Valid balance is required' 
        });
      }

      const user = await authService.updateUserBalance(userId, balance);
      
      res.json({ 
        success: true, 
        data: user,
        message: 'Balance updated successfully'
      });
    } catch (error) {
      console.error('Error in updateBalance:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  /**
   * 删除用户 (管理员功能)
   */
  async deleteUser(req, res) {
    try {
      const { userId } = req.params;
      await authService.deleteUser(userId);
      
      res.json({ 
        success: true,
        message: 'User deleted successfully' 
      });
    } catch (error) {
      console.error('Error in deleteUser:', error);
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }

  // 将模拟日期向前推一天
  async advanceSimulationDate(req, res) {
    try {
      const userId = req.user?.userId || req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // 获取当前用户
      const currentUser = await authService.getUserById(userId);
      if (!currentUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // 直接推进一天
      const updatedUser = await authService.advanceSimulationDate(userId);
      
      res.json({
        success: true,
        data: updatedUser,
        message: 'Simulation date advanced successfully'
      });
    } catch (error) {
      console.error('Advance simulation date error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
