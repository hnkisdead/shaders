import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                fractal: resolve(__dirname, 'pages/fractal/index.html'),
                faded_focus: resolve(__dirname, 'pages/faded_focus/index.html'),
                autumnal_paradise: resolve(__dirname, 'pages/autumnal_paradise/index.html'),
            },
        },
    },
})
