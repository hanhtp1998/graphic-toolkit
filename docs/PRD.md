# Pixel Forge — Product Requirements Document

**Version:** 1.2
**Status:** In Progress
**Last Updated:** May 2026

## Update Log
- 2026-05-20 — v1.2: Competitive analysis completed — added Section 1.4 Competitive Positioning. SVG output identified as primary moat vs effect.app (video/animation), Canva (raster templates), and Figma (no raster-to-effect conversion). Target audience refined: graphic designers and design system designers, not content creators.
- 2026-05-20 — v1.1: Product pivot — expand from icon generator to multi-effect image processing tool. Icon set becomes one mode inside. Default output switches to aspect ratio preservation. Bug found: non-square images distorted to square silently. Halftone/dot/ASCII planned for v2.0.
- 2026-05-10 — v1.0: Initial PRD created

---

## 1. Overview

### 1.1 Product Summary
Pixel Forge is a browser-based image effect tool that transforms raster images (PNG, JPG, GIF, WEBP, SVG) into styled graphic assets. Users upload one or more images, apply visual effects (starting with pixel-art style), configure output settings, preview the result, and download production-ready files.

**Icon set generation** (square ratio, multiple sizes, ZIP batch) is one output mode within the tool — not the only mode.

> **v1.0 description (archived):** "SVG icon generator that converts raster images into pixel-art style SVG icons"
> **Why changed:** Tool scope expanding to graphic design assets beyond icon sets. Aspect ratio preservation needed as default to avoid silent distortion on non-square images.

### 1.2 Problem Statement
Designers who want to apply consistent visual effects to images for graphic design work (posters, editorial, branding, icon sets) face fragmented tools: raster editors don't export clean SVGs, and dedicated pixel-art tools assume square icon output. There is no browser-based tool that goes from photo/illustration → styled graphic asset → scalable output while preserving the original image proportions.

### 1.3 Target Users

**Primary:**
- **Graphic designers** creating styled assets for posters, editorial layouts, and branding
- **Design system designers** building icon sets or illustration libraries with a consistent aesthetic

**Secondary:**
- Frontend developers generating styled SVG assets without Illustrator
- UI/UX designers working on retro or pixel-art design systems

**Not targeting:** Social media content creators, video producers, animators — those are served by effect.app, Canva, and After Effects.

---

### 1.4 Competitive Positioning *(added v1.2)*

**Primary moat: SVG output.**
No mainstream tool converts raster images into production-ready SVG assets with artistic effects applied. Effect.app outputs MP4/PNG (video-first, content creators). Canva outputs PNG/PDF (template-based, raster). Figma is a vector editor but cannot convert raster → stylized SVG. This combination — raster input + artistic effect + scalable SVG output — is the gap Pixel Forge owns.

**Secondary moat: designer workflow.**
Output opens natively in Figma, VS Code, and any browser without conversion. SVG files drop directly into codebases and design systems. No re-export, no format friction.

**Tertiary moat: client-side privacy.**
All processing runs in the browser. No image data is uploaded to any server. Designers working with NDA-protected assets (unreleased branding, client work) can use the tool without legal risk.

| Competitor | Category | Output | Why not a threat |
|---|---|---|---|
| effect.app | Animated effects / content creators | MP4, WebM, PNG | Video-first, no SVG, different audience |
| Canva | Template-based design | PNG, PDF | No effect conversion pipeline, raster only |
| Figma | Vector editor | SVG | Cannot convert raster → stylized SVG |
| Photoshop | Raster editor | PSD, PNG | Desktop + subscription, no SVG output |
| Aseprite | Manual pixel art | PNG, GIF | Manual drawing only, no photo conversion |

**Positioning statement:** The only browser tool that converts photos and illustrations into production-ready SVG graphic assets with artistic effects — built for designers, not content creators.

---

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Fast asset generation | Upload → download in under 10 seconds for ≤10 images |
| Clean SVG output | Output SVGs open correctly in Figma, browser, and VS Code |
| Aspect ratio preservation | Default output preserves original image proportions — no silent distortion |
| Transparent background | Zero white/solid bg pixels in output for PNG sources |
| Batch efficiency | All sizes × all images delivered in one ZIP |
| Usability | New users complete a generation without instructions |

---

## 3. Features & Requirements

### 3.1 Image Upload

| ID | Requirement | Priority |
|---|---|---|
| F1.1 | Accept PNG, JPG, JPEG, GIF, WEBP, SVG file types | Must Have |
| F1.2 | Support multiple file upload in a single action | Must Have |
| F1.3 | Support drag-and-drop upload | Must Have |
| F1.4 | Deduplicate files by name + file size | Must Have |
| F1.5 | Show per-file status: READY / ERR / pending | Must Have |
| F1.6 | Show thumbnail preview of each uploaded file | Should Have |
| F1.7 | Allow individual file removal from the queue | Must Have |

### 3.2 Output Ratio Mode *(updated in v1.1)*

| ID | Requirement | Priority |
|---|---|---|
| F2.1 | **Preserve aspect ratio mode (default):** scale image to fit grid while maintaining original proportions | Must Have |
| F2.2 | **Square mode (icon set):** stretch/crop to square — user must explicitly enable this | Must Have |
| F2.3 | Mode toggle clearly labeled so user understands the difference | Must Have |
| F2.4 | Adjustable grid size from 4×4 to 64×64 (applied to longest edge in preserve mode) | Must Have |
| F2.5 | Grid changes re-process all queued images live | Must Have |

> **Bug fixed by F2.1:** Previously all images were silently forced to square ratio, distorting non-square inputs with no warning. Root cause: canvas width = height = grid size hardcoded in processor.js / svgBuilder.js.

### 3.3 Image Adjustments

| ID | Requirement | Priority |
|---|---|---|
| F3.1 | Contrast adjustment (−100 to +100) applied before quantization | Must Have |
| F3.2 | Color quantization using median-cut algorithm (2–32 colors) | Must Have |
| F3.3 | Background removal via corner-sampling with adjustable tolerance (0–120) | Must Have |
| F3.4 | Transparency always preserved in output | Must Have |
| F3.5 | All adjustments update the preview in real time | Must Have |

### 3.4 Pixel-Art Outline

| ID | Requirement | Priority |
|---|---|---|
| F4.1 | Optional pixel-art outline drawn around the shape silhouette | Must Have |
| F4.2 | Outline color picker (default: #1a1612) | Must Have |
| F4.3 | Outline thickness: 1, 2, or 3 pixel cells | Must Have |
| F4.4 | Outline uses edge-detection (4-directional neighbor check) with corner gap fill | Must Have |
| F4.5 | Outline baked into SVG output as `<rect>` elements | Must Have |

### 3.5 Preview

| ID | Requirement | Priority |
|---|---|---|
| F5.1 | Live SVG preview updates on every setting change | Must Have |
| F5.2 | Preview renders on checkerboard background to show transparency | Must Have |
| F5.3 | Tab switcher when multiple files are loaded | Should Have |
| F5.4 | Color palette swatch display showing all unique colors in current output | Should Have |

### 3.6 Output Sizes

| ID | Requirement | Priority |
|---|---|---|
| F6.1 | Predefined size options: 16, 24, 32, 48, 64, 96, 128, 256, 512 px | Must Have |
| F6.2 | Multi-select: any combination of sizes can be active simultaneously | Must Have |
| F6.3 | In preserve mode: size applies to longest edge | Must Have |
| F6.4 | Default selection: 32px, 64px, 128px | Should Have |

### 3.7 SVG Generation

| ID | Requirement | Priority |
|---|---|---|
| F7.1 | Output SVG uses `<rect>` elements only | Must Have |
| F7.2 | `shape-rendering="crispEdges"` set on root SVG element | Must Have |
| F7.3 | Transparent pixels (alpha < 5) omitted from output | Must Have |
| F7.4 | Semi-transparent pixels render with `opacity` attribute | Should Have |
| F7.5 | SVG canvas size expands to accommodate outline padding | Must Have |
| F7.6 | Output filename format: `{basename}-{size}px-{N}grid.svg` | Must Have |

### 3.8 Export & Download *(updated in v1.1)*

| ID | Requirement | Priority |
|---|---|---|
| F8.1 | **Export mode: ZIP** — all files × all sizes packed into a single ZIP | Must Have |
| F8.2 | **Export mode: Single file** — download one SVG for the currently previewed image | Should Have |
| F8.3 | ZIP uses DEFLATE compression (level 6) | Should Have |
| F8.4 | Each image gets its own subfolder inside ZIP | Should Have |
| F8.5 | ZIP filename: `pixel-icons-{N}grid.zip` | Should Have |
| F8.6 | ZIP generated client-side using JSZip (no server upload) | Must Have |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|---|---|
| NF1 | Entirely client-side — no image data leaves the browser |
| NF2 | Works without installation; runs in a standard web browser |
| NF3 | No backend or API dependencies for core functionality |
| NF4 | JSZip loaded from cdnjs CDN; tool degrades gracefully if CDN unavailable |
| NF5 | All canvas operations wrapped in try/catch with visible error feedback |

---

## 5. Out of Scope (v1.1)

- Additional effect modes beyond pixel art (halftone, dot, ASCII) — planned v2.0
- Custom color palette input
- Dithering algorithms (Floyd-Steinberg, ordered)
- Animation / GIF export
- SVG path tracing (`<path>` instead of rects)
- Cloud storage or save/load sessions
- Undo/redo history
- Per-image settings (each image shares global settings)
- UI framework migration (shadcn) — evaluate after v2.0 scope is confirmed

---

## 6. Future Considerations (v2.0+)

- **Halftone effect** — convert image to halftone dot pattern, configurable dot size and angle
- **Dot/Pointillism effect** — render image as colored dots, configurable density
- **ASCII art effect** — render image as ASCII characters, configurable charset and size
- **Multi-effect pipeline** — apply multiple effects in sequence
- **Tool rename** — rename from "Pixel Forge" to reflect multi-effect scope (decide after v2.0 effects confirmed)
- **Per-image settings override** — allow grid size / contrast / palette to differ per file
- **Custom palette editor** — fixed palette (Game Boy, CGA, NES) remapped to all images
- **SVG path output** — trace pixel clusters into `<path>` shapes for smaller file sizes
- **Figma plugin** — run Pixel Forge directly inside Figma
- **CLI version** — `npx pixel-forge input/*.png --grid 16 --colors 8`
- **UI overhaul with shadcn** — evaluate after multi-effect scope is confirmed; consider aesthetic trade-off with current retro style

---

## 7. Technical Architecture

```
Browser
├── FileReader API          → reads uploaded files as base64 dataURLs
├── HTMLCanvasElement       → scales images to N×N grid, reads pixel data
│   └── Aspect ratio logic  → scale to longest edge (preserve mode) or force square (icon mode)
├── Image processing pipeline
│   ├── applyContrast()     → standard contrast formula
│   ├── quantizeColors()    → median-cut algorithm
│   └── removeBackground()  → corner-sampling + color distance threshold
├── SVG Builder
│   ├── buildSVG()          → generates <rect> elements per opaque pixel
│   └── outline renderer    → edge-detection, 4-dir + corner gap fill
└── JSZip (CDN)             → client-side ZIP generation + download
```

---

## 8. UI/UX Design Principles

- **Retro editorial aesthetic** — warm cream palette, terracotta and gold accents, hard pixel borders, Press Start 2P + Space Mono typography
- **Step-by-step layout** — numbered steps (01–04) guide the user linearly
- **Real-time feedback** — every setting change immediately updates the preview
- **Sticky export bar** — always-visible download button regardless of scroll position
- **No silent failures** — any distortion, error, or mode change must be visible to the user
