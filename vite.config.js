import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        'tools/pixel-forge': new URL('./tools/pixel-forge/index.html', import.meta.url).pathname,
      }
    }
  }
})
