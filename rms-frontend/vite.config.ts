import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [react()],
  define: {
    'import.meta.env.VITE_SUPER_ADMIN_NAME': JSON.stringify(env.SUPER_ADMIN ?? env.super_admin ?? ''),
  },
  }
})
