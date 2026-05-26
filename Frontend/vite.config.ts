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

  // --- CONFIGURAÇÃO DE SERVIDOR (PROXY) ---
  server: {
    proxy: {
      // Roteamento para o Microsserviço de GESTÃO
      '/api-gestao': {
        target: 'http://gestaomod2.azurewebsites.net', 
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-gestao/, '/api')
      },
      
      // Roteamento para o Microsserviço de INGESTÃO
      '/api-ingestao': {
        target: 'https://ingestaomod2.azurewebsites.net',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-ingestao/, '/api')
      }
    }
  }
})
