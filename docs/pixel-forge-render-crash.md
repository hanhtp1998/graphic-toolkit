---
status: resolved
slug: pixel-forge-render-crash
trigger: TypeError: Cannot destructure property 'r' of pixel data array — index out of bounds in pixel-forge preview renderer
created: 2026-05-19
updated: 2026-05-19
---

## Symptoms

- expected: SVG pixel-art preview and color palette render after image upload
- actual: crash on any image upload — preview never renders
- error_messages: |
    Failed to load resource: 404
    Uncaught TypeError: Cannot destructure property 'r' of 'e[((n * t) + r)]' as it is undefined.
      at g (pixel-forge-CnBMXiv7.js:11:846)
      at v.render (pixel-forge-CnBMXiv7.js:11:3243)
      at C.onFilesChanged
- timeline: worked before, broke recently
- reproduction: upload any image to Pixel Forge

## Current Focus

hypothesis: "pixelData gridSize and previewManager.gridSize are out of sync — addFiles always processed at hardcoded gridSize=16 regardless of slider position"
test: "confirmed via code trace"
expecting: "crash whenever slider differs from 16 at upload time, or after rapid slider changes (race)"
next_action: "resolved — fixes applied"

## Evidence

- timestamp: 2026-05-19T00:00:00Z
  finding: "upload.js processFile() defaulted gridSize to 16 hardcoded when called from addFiles, ignoring current slider value"
  file: src/tools/pixel-forge/upload.js
  line: 70

- timestamp: 2026-05-19T00:00:00Z
  finding: "reprocessAll() launched multiple async processFile calls with no cancellation — out-of-order completion could set wrong-sized pixelData while previewManager.gridSize was already updated"
  file: src/tools/pixel-forge/upload.js
  line: 88-95

- timestamp: 2026-05-19T00:00:00Z
  finding: "buildSVG() had no bounds check on pixelData[y * gridSize + x] — any mismatch caused unhandled TypeError instead of graceful empty render"
  file: src/tools/pixel-forge/svgBuilder.js
  line: 9

- timestamp: 2026-05-19T00:00:00Z
  finding: "main.js never synced uploadManager with current slider values on init or after outline slider changes"
  file: src/tools/pixel-forge/main.js

- timestamp: 2026-05-19T00:00:00Z
  finding: "404 error was browser auto-requesting /favicon.ico — tools/pixel-forge/index.html had no favicon link tag"
  file: tools/pixel-forge/index.html

## Eliminated

- processImage returning wrong-length array (all transforms use .map() — length is always gridSize*gridSize)
- canvas thumbnail resize corrupting pixel data (thumbnail resize happens after pixel extraction)
- quantizeColors filter step shrinking the array (filter is internal only; return uses .map())

## Resolution

root_cause: "addFiles called processFile with no settings (hardcoded gridSize=16) while previewManager.gridSize reflected the current slider value — any slider position other than 16 caused buildSVG to iterate beyond pixelData bounds. A race condition in reprocessAll (no cancellation of in-flight calls) could also produce stale-size pixelData."
fix: |
  1. upload.js: Added UploadManager.currentSettings property; addFiles now reads it so every initial processing uses the active slider values. reprocessAll updates currentSettings before spawning calls.
  2. upload.js: Added _processToken per file to discard stale async results when a newer processFile call supersedes the old one.
  3. main.js: Added syncSettings() helper called on page load and on every slider change event. Removed unreliable setTimeout render in reprocessAll (onFilesChanged drives render after completion). Fixed outline state (outlineEnabled, outlineColor, outlineThickness) kept in sync on slider changes.
  4. svgBuilder.js: Added bounds guard — returns empty SVG if pixelData.length < gridSize*gridSize instead of crashing.
  5. tools/pixel-forge/index.html: Added favicon.svg link to eliminate the 404 error.
verification: "code trace confirms pixelData.length === previewManager.gridSize^2 for all upload paths; _processToken ensures no stale results reach render; svgBuilder guard is last-resort safety net"
files_changed:
  - src/tools/pixel-forge/upload.js
  - src/tools/pixel-forge/main.js
  - src/tools/pixel-forge/svgBuilder.js
  - tools/pixel-forge/index.html
