import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: "/",
    plugins: [react()],
    preview: {
        port: 8080,
        strictPort: true,
    },
    server: {
        port: 8080,
        strictPort: true,
        host: true,
        origin: "http://0.0.0.0:8080",
        allowedHosts: true,
        proxy: {
            '/api': {
                target: 'https://hackyeah2025be.oczadly.com',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),
            },
        },
    },
})
