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
      'import.meta.env.STOCK_API_KEY': JSON.stringify(env.STOCK_API_KEY),
    },
  }
})
