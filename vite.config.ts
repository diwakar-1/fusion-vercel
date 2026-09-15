import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import http from 'http';

function autoBackendPlugin() {
  let backendProcess: any = null;
  return {
    name: 'auto-backend-starter',
    configureServer(server: any) {
      // Check if port 8000 backend is active; if not, auto-spawn server.js
      const req = http.get('http://127.0.0.1:8000/health', () => {
        // Backend already running
      });

      req.on('error', () => {
        console.log('\n[FUSION] Starting real-time backend engine on port 8000...');
        try {
          backendProcess = spawn('node', ['server.js'], {
            stdio: 'inherit'
          });
        } catch (err) {
          console.warn('[FUSION] Could not auto-start server.js:', err);
        }
      });

      server.httpServer?.on('close', () => {
        if (backendProcess) {
          try {
            backendProcess.kill();
          } catch {}
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), autoBackendPlugin()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res: any) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend offline', code: 'ECONNREFUSED' }));
            }
          });
        }
      },
      '/health': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res: any) => {
            if (res && !res.headersSent && typeof res.writeHead === 'function') {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ status: 'offline' }));
            }
          });
        }
      }
    }
  }
});
