import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
// API traffic goes directly to https://fussion-api.onrender.com (not localhost).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
});
