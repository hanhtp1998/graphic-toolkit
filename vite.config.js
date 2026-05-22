import { defineConfig } from 'vite'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.0.0'),
  },
  plugins: [
    {
      // Injects Vercel Analytics script into every HTML page at build time.
      // The actual script is served by Vercel CDN edge — nothing loads in dev.
      name: 'inject-vercel-analytics',
      transformIndexHtml(html) {
        return html.replace(
          '</body>',
          `<script defer src="/_vercel/insights/script.js"></script>\n</body>`
        );
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        'tools/pixel-forge': new URL('./tools/pixel-forge/index.html', import.meta.url).pathname,
      }
    }
  }
})
