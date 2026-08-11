import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_PROXY_TARGET || 'https://crm.acstechnologies.co.in',
          changeOrigin: true,
        },
      },
      allowedHosts: ['localhost', '127.0.0.1', '.ngrok.io', '.ngrok-free.app'],
    },
  }
})