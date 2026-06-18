import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite konfiguratsiyasi — React va Tailwind CSS v4 plaginlari ulangan
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
