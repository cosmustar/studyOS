import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite: servidor de desenvolvimento + empacotador.
// Plugins: React (JSX, hot reload) e Tailwind CSS v4.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
