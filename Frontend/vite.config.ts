import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],

server: {
    proxy: {
      // 1. Roteamento para o Microsserviço de GESTÃO
      '/api-gestao': {
        target: 'https://gestaomod2.azurewebsites.net', // Substitua pela URL real da Gestão
        changeOrigin: true,
        secure: false,
        // Isso remove o "-gestao" antes de bater no seu main.py, para que o FastAPI entenda a rota
        rewrite: (path) => path.replace(/^\/api-gestao/, '/api')
      },
      
      // 2. Roteamento para o Microsserviço de INGESTÃO
      '/api-ingestao': {
        target: 'https://ingestaomod2.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        // Isso remove o "-ingestao" antes de bater no main.py da Azure
        rewrite: (path) => path.replace(/^\/api-ingestao/, '/api')
      }
    }
  }
