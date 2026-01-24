import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // For native apps, use root path; for web deployment, use /billing-app/
  const isNative = process.env.CAPACITOR || false;
  const base = isNative ? '/' : (mode === 'production' ? '/billing-app/' : '/');

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: isProd ? '/billing-app/index.html' : '/index.html',
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
          scope: base,
          start_url: base,
          categories: ['business', 'finance', 'productivity'],
          lang: 'zh-CN',
          icons: [
            {
              src: isProd ? '/billing-app/icon-192.png' : '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: isProd ? '/billing-app/icon-512.png' : '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: isProd ? '/billing-app/icon-512.png' : '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ],
          screenshots: [
            {
              src: isProd ? '/billing-app/icon-512.png' : '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              form_factor: 'narrow',
              label: '智能开单系统主界面'
            },
            {
              src: isProd ? '/billing-app/icon-512.png' : '/icon-512.png',
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
              url: isProd ? '/billing-app/billing' : '/billing',
              icons: [{ src: isProd ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
            },
            {
              name: '查看控制台',
              short_name: '控制台',
              description: '查看销售统计',
              url: base,
              icons: [{ src: isProd ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
            },
            {
              name: '客户管理',
              short_name: '客户',
              description: '管理客户信息',
              url: isProd ? '/billing-app/customers' : '/customers',
              icons: [{ src: isProd ? '/billing-app/icon-192.png' : '/icon-192.png', sizes: '192x192' }]
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
      cors: {
        origin: true,
        credentials: true
      },
      allowedHosts: true,
      hmr: {
        clientPort: 8080,
        protocol: 'ws',
        host: '0.0.0.0'
      }
    },
    preview: {
      host: '0.0.0.0',
      port: 8080,
      open: true,
      cors: {
        origin: true,
        credentials: true
      },
      allowedHosts: true
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
        }
      },
      chunkSizeWarningLimit: 1000
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react']
    }
  };
});
