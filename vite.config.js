import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // The backend's CORS rules only allow http://localhost:5173. If this port is
    // busy, fail instead of silently moving to 5174 (which would make every API
    // call show "Failed to fetch").
    port: 5173,
    strictPort: true,
  },
})
