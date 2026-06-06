import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/lopos-loja/',  // ← nome do teu repositório GitHub
})
