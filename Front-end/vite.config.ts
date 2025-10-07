import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [],
  server: {
    host: '0.0.0.0',
    port: 5173,
    https: {
      key: fs.existsSync(path.resolve(__dirname, '../certs/localhost.key')) 
        ? fs.readFileSync(path.resolve(__dirname, '../certs/localhost.key'))
        : undefined,
      cert: fs.existsSync(path.resolve(__dirname, '../certs/localhost.crt'))
        ? fs.readFileSync(path.resolve(__dirname, '../certs/localhost.crt'))
        : undefined,
    },
    cors: true,
    allowedHosts: ['5176-iq9tmrflwz2r5v1vhgrcn-fc69a50f.manusvm.computer', 'all'],
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
