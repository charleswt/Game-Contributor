import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
    server: {
    port: 4000,
    open: true,
    proxy: {
      '/graphql': {
        target: 'http://localhost:10000',
        changeOrigin: true,
        secure: true,
      },
    }
  },
  build: {
    rollupOptions: {
      external: ['./public/scss'],
    },
  },
})