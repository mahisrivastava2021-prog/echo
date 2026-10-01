import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this repo at https://<user>.github.io/echo/, so asset URLs need this prefix.
  base: '/echo/',
  plugins: [react()],
})
