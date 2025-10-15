import { defineConfig } from 'vite'
import path from 'node:path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/portfolio/' : '/',
  assetsInclude: ['**/*.glb', '**/*.otf'],
  publicDir: 'public',
  server: {
    fs: {
      
      allow: ['..']
    }
  },
  resolve: {
    preserveSymlinks: true,
    alias: {
      three: path.resolve(process.cwd(), 'node_modules/three'),
      'three-stdlib': path.resolve(process.cwd(), 'node_modules/three-stdlib')
    },
    dedupe: ['react', 'react-dom', 'three']
  },
  optimizeDeps: {
    include: ['three', 'three-stdlib']
  },
  build: {
    // Prevent inlining of GLB files
    assetsInlineLimit: 0
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.js',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '*.config.js',
        'dist/'
      ]
    }
  }
})