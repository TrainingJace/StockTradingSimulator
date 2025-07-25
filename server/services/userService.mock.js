// Mock 用户数据
const mockUsers = [
  {
    id: 1,
    username: 'john_doe',
    email: 'john@example.com',
    balance: 10000,
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'jane_smith',
    email: 'jane@example.com',
    balance: 15000,
    createdAt: '2024-01-02T00:00:00.000Z'
  }
];

class UserService {
  async getUserById(userId) {
    console.log(`[MOCK] Getting user by ID: ${userId}`);
    const user = mockUsers.find(u => u.id === parseInt(userId));
    return user || null;
  }

  async getUserByUsername(username) {
    console.log(`[MOCK] Getting user by username: ${username}`);
    const user = mockUsers.find(u => u.username === username);
    return user || null;
  }

  async createUser(userData) {
    console.log(`[MOCK] Creating user:`, userData);
    const newUser = {
      id: mockUsers.length + 1,
      ...userData,
      balance: userData.balance || 10000,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  async updateUserBalance(userId, newBalance) {
    console.log(`[MOCK] Updating balance for user ${userId}: ${newBalance}`);
    const user = mockUsers.find(u => u.id === parseInt(userId));
    if (user) {
      user.balance = newBalance;
      return user;
    }
    return null;
  }

  async getAllUsers() {
    console.log(`[MOCK] Getting all users`);
    return mockUsers;
  }
}

module.exports = new UserService();
