import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    server: {
    port: 4000,
    open: true,
    proxy: {
      '/graphql': {
        target: 'https://localhost:4001',
        changeOrigin: true,
        secure: false,
      },
    }
  }
})