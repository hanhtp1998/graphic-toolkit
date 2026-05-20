import { buildSVG } from './svgBuilder.js';
import { buildHalftoneSVG } from './halftone.js';
import { buildPointillismSVG } from './pointillism.js';
import { buildAsciiSVG } from './ascii.js';
import JSZip from 'jszip';

function buildSVGForEffect(f, size, effect, effectSettings, outlineEnabled, outlineColor, outlineThickness) {
  const s = effectSettings;
  switch (effect) {
    case 'halftone':
      return buildHalftoneSVG(f.pixelData, f.gridW, f.gridH, size, s.dotScale ?? 0.9, s.bgWhite ?? false);
    case 'pointillism':
      return buildPointillismSVG(f.pixelData, f.gridW, f.gridH, size, s.minR ?? 0.2, s.maxR ?? 0.9, s.bgWhite ?? true);
    case 'ascii':
      return buildAsciiSVG(f.pixelData, f.gridW, f.gridH, size, s.ramp, s.colorMode ?? 'mono');
    default:
      return buildSVG(f.pixelData, f.gridW, f.gridH, size, outlineEnabled, outlineColor, outlineThickness);
  }
}

export class ExportManager {
  constructor() {
    this.statusEl = null;
  }

  setupUI(statusEl) {
    this.statusEl = statusEl;
  }

  async exportZip(files, gridSize, selectedSizes, outlineEnabled, outlineColor, outlineThickness, effect = 'pixel-art', effectSettings = {}) {
    const readyFiles = files.filter(f => f.status === 'ok');
    if (!readyFiles.length || !selectedSizes.size) {
      this.statusEl.textContent = '✗ NO FILES OR SIZES!';
      return;
    }

    this.statusEl.textContent = 'PACKING ZIP...';

    const zip = new JSZip();
    const sorted = Array.from(selectedSizes).sort((a, b) => a - b);

    readyFiles.forEach(f => {
      const base = f.name.replace(/\.[^.]+$/, '');
      const folder = zip.folder(base);

      sorted.forEach(size => {
        const svgContent = buildSVGForEffect(f, size, effect, effectSettings, outlineEnabled, outlineColor, outlineThickness);
        folder.file(`${base}-${size}px-${effect}-${gridSize}grid.svg`, svgContent);
      });
    });

    try {
      const blob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (m) => {
          this.statusEl.textContent = `PACKING... ${m.percent.toFixed(0)}%`;
        }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixel-icons-${gridSize}grid.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 2000);

      const total = readyFiles.length * sorted.length;
      this.statusEl.textContent = `✓ ${total} SVG${total > 1 ? 's' : ''} IN 1 ZIP!`;
      setTimeout(() => (this.statusEl.textContent = ''), 5000);
    } catch (e) {
      this.statusEl.textContent = 'ERR: ' + e.message;
    }
  }
}
