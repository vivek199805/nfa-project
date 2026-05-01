import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const pathParts = id.split('node_modules/')[1].split('/');
            const pkgName = pathParts[0].startsWith('@') ? `${pathParts[0]}/${pathParts[1]}` : pathParts[0];
            return `vendor-${pkgName.replace('@', '').replace('/', '-')}`;
          }
        },
      },
    },
  },
})
