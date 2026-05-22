# Graphic Toolkit

## What This Is
A multi-tool web app for designers — each tool is a separate page under one roof. Tool #1: Pixel Forge — batch SVG asset generator: converts multiple images into consistent SVG sets across multiple sizes in one ZIP export.

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
├── _diary/                     ← Vibe coding journey diary (raw dev log per tool)
│   └── pixel-forge.md
├── docs/
│   └── PRD.md
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
│           ├── processor.js    ← Contrast, quantize, bg removal (shared pipeline)
│           ├── svgBuilder.js   ← Pixel art SVG builder
│           ├── halftone.js     ← Halftone SVG builder
│           ├── pointillism.js  ← Pointillism SVG builder
│           ├── ascii.js        ← ASCII art SVG builder
│           ├── preview.js      ← Preview tabs, palette display
│           └── exporter.js     ← ZIP generation + download
├── vite.config.js              ← Multi-page app config
└── package.json
```

### `_diary/` convention
Each tool gets a `_diary/{tool-name}.md` — a running raw log of decisions, bugs, pivots, and learnings. Not polished. Not the PRD. Source material for case studies and articles.

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
- PRD: `docs/PRD.md`
- Dev diary: `_diary/pixel-forge.md`
- Session logs: `../../../_logs/LOG_YYYY-MM-DD.md`
- Journey (vault): `Ralphenamenon/pages/W_PF_Pixel Forge Journey.md`

---
**Last Updated:** 2026-05-22
