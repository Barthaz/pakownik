import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const siteUrl = (process.env.VITE_SITE_URL ?? 'https://pakownik.pl').replace(/\/$/, '')

function injectSiteUrl(): Plugin {
  return {
    name: 'inject-site-url',
    transformIndexHtml(html) {
      return html.replaceAll('%SITE_URL%', siteUrl)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), injectSiteUrl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './assets'),
    },
  },
  preview: {
    // Odświeżenie podstrony (np. /logowanie) w vite preview
    host: true,
  },
  appType: 'spa',
})
