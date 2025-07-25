const services = require('../services');

class UserController {
  async getUser(req, res) {
    try {
      const { userId } = req.params;
      const user = await services.userService.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error in getUser:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getUserByUsername(req, res) {
    try {
      const { username } = req.params;
      const user = await services.userService.getUserByUsername(username);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, data: user });
    } catch (error) {
      console.error('Error in getUserByUsername:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createUser(req, res) {
    try {
      const { username, email, balance } = req.body;

      // 基本验证
      if (!username || !email) {
        return res.status(400).json({ error: 'Username and email are required' });
      }

      // 检查用户名是否已存在
      const existingUser = await services.userService.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      const userData = { username, email, balance };
      const newUser = await services.userService.createUser(userData);

      // 创建用户成功后，自动创建投资组合
      if (services.portfolioService) {
        await services.portfolioService.createPortfolio(newUser.id, balance || 10000);
      }

      res.status(201).json({ success: true, data: newUser });
    } catch (error) {
      console.error('Error in createUser:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateUserBalance(req, res) {
    try {
      const { userId } = req.params;
      const { balance } = req.body;

      if (typeof balance !== 'number' || balance < 0) {
        return res.status(400).json({ error: 'Invalid balance amount' });
      }

      const updatedUser = await services.userService.updateUserBalance(userId, balance);
      
      if (!updatedUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, data: updatedUser });
    } catch (error) {
      console.error('Error in updateUserBalance:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await services.userService.getAllUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error in getAllUsers:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new UserController();
