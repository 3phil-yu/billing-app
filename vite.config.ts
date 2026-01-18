import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/billing-app/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: process.env.NODE_ENV === 'production' ? '/billing-app/index.html' : '/index.html',
        navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'gemini-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 // 1 hour
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.ico', 'icon-192.png', 'icon-512.png', 'vite.svg'],
      manifest: {
        name: '智能开单系统',
        short_name: '开单宝',
        description: '专业、智能的财务对账与开单管理系统，支持AI图片识别',
        theme_color: '#7c3aed',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: process.env.NODE_ENV === 'production' ? '/billing-app/' : '/',
        start_url: process.env.NODE_ENV === 'production' ? '/billing-app/' : '/',
        categories: ['business', 'finance', 'productivity'],
        lang: 'zh-CN',
        icons: [
          {
            src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-192.png' : '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-512.png' : '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-512.png' : '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-512.png' : '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'narrow',
            label: '智能开单系统主界面'
          },
          {
            src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-512.png' : '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide',
            label: '桌面版智能开单系统'
          }
        ],
        shortcuts: [
          {
            name: '快速开单',
            short_name: '开单',
            description: '立即创建新订单',
            url: process.env.NODE_ENV === 'production' ? '/billing-app/billing' : '/billing',
            icons: [{ src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: '查看控制台',
            short_name: '控制台',
            description: '查看销售统计',
            url: process.env.NODE_ENV === 'production' ? '/billing-app/' : '/',
            icons: [{ src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: '客户管理',
            short_name: '客户',
            description: '管理客户信息',
            url: process.env.NODE_ENV === 'production' ? '/billing-app/customers' : '/customers',
            icons: [{ src: process.env.NODE_ENV === 'production' ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
          }
        ],
        related_applications: [],
        prefer_related_applications: false
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
    cors: true
  },
  preview: {
    host: '0.0.0.0',
    port: 8080,
    open: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'framer-motion'],
          ai: ['@google/generative-ai']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
  }
})
