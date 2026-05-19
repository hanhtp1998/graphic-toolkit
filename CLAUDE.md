# Graphic Toolkit

## What This Is
A multi-tool web app for designers — each tool is a separate page under one roof. Tool #1: Pixel Forge (SVG pixel icon generator from raster images).

## Tech Stack & Why
| Layer | Choice | Reason |
|---|---|---|
| Build tool | Vite | Zero-config, fast HMR, static output for Vercel |
| Language | Vanilla JS (ES modules) | No framework overhead |
| CSS | Single shared stylesheet | Design tokens as CSS variables |
| ZIP | JSZip (npm) | Client-side ZIP, bundled into output |

100% client-side — all image processing runs in the browser via Canvas API. No server, no image data leaves the browser.

## Project Structure
```
graphic-toolkit/
├── index.html                  ← Hub / landing page (tool cards)
├── tools/
│   └── pixel-forge/
│       └── index.html          ← Pixel Forge tool page
├── src/
│   ├── style.css               ← Shared design tokens + components
│   ├── components/
│   │   └── nav.js              ← Shared header/nav
│   └── tools/
│       └── pixel-forge/
│           ├── main.js         ← Entry point, wires modules
│           ├── upload.js       ← File input, drag/drop, file list UI
│           ├── processor.js    ← Contrast, quantize, bg removal
│           ├── svgBuilder.js   ← buildSVG(), outline renderer
│           ├── preview.js      ← Preview tabs, palette display
│           └── exporter.js     ← ZIP generation + download
├── vite.config.js              ← Multi-page app config
└── package.json
```

### Adding a new tool
```
tools/[tool-name]/index.html
src/tools/[tool-name]/main.js
```
Register the new entry in `vite.config.js`. Add a card on `index.html`.

## Local Development
```bash
cd hanh-work/projects/vibe-tools/graphic-toolkit
npm run dev     # → localhost:5173
npm run build   # production build
npm run preview # preview production build
```

## Deployment
- Auto-deploy: push to GitHub → Vercel picks up via webhook
- Output: fully static, zero server cost
- Check deploy status: Vercel dashboard

## Code Style
- No CSS framework — design tokens only via CSS variables (`--color-primary`, `--spacing-sm`)
- Each tool module has single responsibility (one concern per file)
- No comments except WHY (not WHAT)

## References
- Session notes: `../graphic-toolkit-session.md`
- PRD: `/Users/phuonghanhtran/Downloads/pixel-forge-prd.md`
- Original artifact: `/Users/phuonghanhtran/Downloads/pixel-svg-generator.html`

---
**Last Updated:** 2026-05-19
