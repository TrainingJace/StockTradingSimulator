import apiClient from './client.js';

export const watchlistApi = {
    // 获取用户观察列表
    async getWatchlist() {
        const response = await apiClient.get('/watchlist');
        return response;
    },

    // 添加股票到观察列表
    async addToWatchlist(symbol) {
        const response = await apiClient.post('/watchlist', { symbol });
        return response;
    },

    // 从观察列表移除股票
    async removeFromWatchlist(symbol) {
        const response = await apiClient.delete(`/watchlist/${symbol}`);
        return response;
    },

    // 检查股票是否在观察列表中
    async isInWatchlist(symbol) {
        const response = await apiClient.get(`/watchlist/check/${symbol}`);
        return response;
    }
};
