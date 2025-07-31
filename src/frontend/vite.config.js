import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, '../../', '')
  
  return {
    plugins: [react()],
    define: {
      // 暴露特定的环境变量到客户端
      'import.meta.env.STOCK_PRICE_KEY': JSON.stringify(env.STOCK_PRICE_KEY),
      'import.meta.env.STOCK_SEARCH_SYMBOL_KEY': JSON.stringify(env.STOCK_SEARCH_SYMBOL_KEY),
      'import.meta.env.STOCK_K_CHART_KEY': JSON.stringify(env.STOCK_K_CHART_KEY),
    },
  }
})
