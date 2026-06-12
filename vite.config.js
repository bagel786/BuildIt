import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // dev: forward API calls to the local Express server (npm run server)
    proxy: {
      '/api': 'http://localhost:8787',
    },
  },
});
