import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/portfolio/' : '/',
  assetsInclude: ['**/*.glb', '**/*.otf'],
  publicDir: 'public',
  build: {
    assetsInlineLimit: 0 // Ne pas inliner les GLB
  }
})