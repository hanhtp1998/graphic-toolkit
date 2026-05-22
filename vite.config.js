import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        'tools/pixel-forge': new URL('./tools/pixel-forge/index.html', import.meta.url).pathname,
      }
    }
  }
})
