import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        fractal: resolve(__dirname, 'fractal/index.html'),
      },
    },
  },
})