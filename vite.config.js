import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/backend/**',
        '**/target/**',
        '**/.venv/**',
        '**/.git/**',
      ],
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      cleanupOutdatedCaches: true,
      manifest: {
        name: 'Tanish Jaswal — Portfolio',
        short_name: 'TJ Portfolio',
        description: 'Data Analyst & AI/ML Portfolio',
        theme_color: '#faf9f6',
        background_color: '#faf9f6',
        display: 'standalone',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }
        ]
      }
    })
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          icons: ['lucide-react'],
        }
      }
    }
  }
})
