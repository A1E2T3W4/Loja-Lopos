import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Loja-Lopos/', // ← Garante que está exatamente assim, com "L" maiúsculos e barras nas pontas
})
