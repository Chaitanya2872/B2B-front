import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
    hmr: {
      host: process.env.VITE_HMR_HOST || 'localhost',
      protocol: process.env.VITE_HMR_PROTOCOL || 'ws',
      port: process.env.VITE_HMR_PORT ? Number(process.env.VITE_HMR_PORT) : undefined,
    },
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
    ],
  },
})
