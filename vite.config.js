import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/chat': 'http://localhost:3000',
      '/meal-plan': 'http://localhost:3000',
      '/shopping-list': 'http://localhost:3000',
      '/affiliate-link': 'http://localhost:3000',
    },
  },
})
