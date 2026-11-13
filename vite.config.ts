import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(repoRoot, 'frontend'),
  envDir: repoRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@react-three/fiber': path.join(repoRoot, 'node_modules/@react-three/fiber'),
      '@react-three/drei': path.join(repoRoot, 'node_modules/@react-three/drei'),
      three: path.join(repoRoot, 'node_modules/three'),
    },
  },
  optimizeDeps: {
    include: ['@react-three/fiber', '@react-three/drei', 'three'],
  },
  server: {
    port: 5173,
    fs: { allow: [repoRoot] },
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ''),
      },
    },
  },
});
