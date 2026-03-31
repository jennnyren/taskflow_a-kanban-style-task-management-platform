import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react'
          if (id.includes('node_modules/@supabase'))  return 'vendor-supabase'
          if (id.includes('node_modules/@dnd-kit'))   return 'vendor-dnd'
          if (id.includes('node_modules/date-fns'))   return 'vendor-utils'
          if (id.includes('node_modules/lucide-react')) return 'vendor-utils'
        },
      },
    },
  },
})
