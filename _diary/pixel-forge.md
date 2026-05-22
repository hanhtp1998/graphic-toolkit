# Pixel Forge — Vibe Coding Diary

A running diary of the Pixel Forge build. Raw decisions, pivots, bugs, learnings — captured as they happen. Not polished. Not edited.

For the polished case study version: vault note `W_PF_Pixel Forge Journey.md`
For product decisions: `docs/PRD.md`

---

## 2026-05-15 — The Origin

Training session "Claude Foundation for Designers" (~40 people, 1h 40m). My section: artifacts.

Needed something visual and interactive to demo artifact capability live. Built a pixel art SVG icon generator directly in Claude chat — no code editor, no terminal. ~500 lines, one HTML file.

**What it showed:** Claude generates working code. Artifacts run in the browser. Vibe coding is real.

**The problem after:** No URL to share. No way to iterate without going back to Claude chat. It lives in my Downloads folder.

**The question:** Can I turn this into a real, hosted, maintainable tool — and learn vibe coding properly in the process?

---

## 2026-05-19 — Modularization: From Demo to Project

Ported the single-file artifact into a proper Vite multi-page app. 6 modules:

```
processor.js   ← image → pixel grid
svgBuilder.js  ← pixel grid → SVG
upload.js      ← file input, drag/drop
preview.js     ← live preview + tabs
exporter.js    ← ZIP generation
main.js        ← wires everything
```

Rule I followed for splitting: if I can't describe a module's job in one sentence without "and", the split is wrong.

Also created the hub `index.html` — home for multiple tools. Pixel Forge is Tool #1.

**First commit. Worked on first `npm run dev`.** Good feeling.

Set up GitHub repo (`hanhtp1998/graphic-toolkit`), labels, milestones. Connected to Vercel. Auto-deploy on push to main.

Lesson: GitHub Issues isn't just a to-do list. Writing an issue forces you to articulate the problem before the code — which is the right order.

---

## 2026-05-22 — The Silent Bug (issue #1, #2)

Found by dogfooding: uploaded a portrait photo. Output was square. Image squished. No error.

This is the worst kind of bug — the tool works, just incorrectly. Silent data corruption.

Root cause: `canvas.width = canvas.height = gridSize` — always square, inherited from the artifact.

Key detail I learned: `img.naturalWidth` not `img.width`. CSS scaling can lie. Natural dimensions are reality.

Fix cascaded through 6 files. Also added Square Mode toggle — bug fix and enhancement in the same commit. (closes #1, closes #2)

---

## 2026-05-22 — Branch experiment: ZIP vs folder export (issue #3)

Idea: instead of ZIP, use `showDirectoryPicker()` to write SVGs directly to a local folder. Cleaner for power users.

Built it on a branch. Tested it. Conclusion: unnecessary complexity. Most users understand ZIP. Folder picker API has permission friction. Branch stayed local, not merged.

**Good use of branching:** experiment without risking main.

---

## 2026-05-22 — Research spike before building effects (issue #4)

Before writing any effect code, evaluated: Canvas 2D vs PixiJS vs p5.js vs Konva.js.

Finding: Canvas 2D is faster than PixiJS at 16–512px icon sizes. WebGL overhead beats draw benefit at small sizes. PixiJS = +380KB for zero benefit. Rejected all 3 libraries.

**Saved 380KB bundle size** by doing the research first.

---

## 2026-05-22 — v2.0: Multi-effect tool (#5–#9)

After competitive research, pivoted Pixel Forge from "pixel art SVG tool" to "SVG image effects tool for designers."

New effects: Halftone, Pointillism, ASCII Art — all reuse the existing `pixelData` pipeline. Zero new dependencies. ~170 lines of new code total.

Architecture insight: the processor (contrast, quantize, bg removal) is effect-agnostic. Only the SVG builder changes per effect.

```
Image → processor.js (shared) → pixelData → [effect builder] → SVG
                                              ├─ svgBuilder.js    (pixel art)
                                              ├─ halftone.js      (NEW)
                                              ├─ pointillism.js   (NEW)
                                              └─ ascii.js         (NEW)
```

UI pattern for panel switching: `[id^="cfg-"]` CSS attribute selector. Adding a new effect = add HTML panel only. No JS changes needed.

---

## 2026-05-22 — Bug: Preview tabs (issue #10)

Multi-file upload → clicking other tabs did nothing. Only first image showed.

Root cause: `renderTabs()` built tab elements but never attached click handlers. Tabs were decoration.

Fix: added `onTabClick` callback to PreviewManager. Main.js wires the state update.

**Mistake I made:** Fixed the bug before creating the GitHub issue. Correct order is issue → fix → `closes #N`. Created #10 retroactively and closed it. Won't repeat.

---

## 2026-05-22 — Competitive research: reality check

Initially thought effect.app was not a competitor. That was wrong.

Full picture after researching brik.space, effect.app, tooooools.app:

| | brik.space | effect.app | tooooools.app |
|---|---|---|---|
| Output | Still/video/HTML embed | PNG, JPEG, MP4/WebM | JPG, PNG, MP4 |
| SVG | ❌ | ❌ | ❌ |
| Batch/multi-size | ❌ | ❌ | ❌ |
| Price | unknown | $12–20/mo | **Free (commercial OK)** |
| Target | Motion designers / agencies | Content creators | General creatives |

**Brik:** AI-generated motion tools and reusable interactive systems. Brand/agency focus. Not about processing your images — about building parameterized motion tools. Different product entirely.

**effect.app:** Image + video effects, content creator focus, paid.

**tooooools.app:** 20+ effects, free for commercial use. This is the closest thing to Pixel Forge in the effects space — and it's free and well-built. Can't compete on effect variety.

**Strategic decision (2026-05-22):** Pixel Forge's moat is NOT "best effects tool." It's:
1. **SVG output** — none of the three competitors output SVG
2. **Batch workflow** — none support multi-file × multi-size export in one ZIP
3. **Designer production workflow** — upload 10 icons → apply effect → 50 SVGs ready for Figma

Will continue adding more effects over time (the more effects the better, like tooooools.app), but the core differentiator is the batch-to-SVG pipeline. That's where we win.

**Positioning updated:** "The only browser tool that converts images into consistent SVG asset sets — multiple files, multiple sizes, production-ready in one ZIP."
