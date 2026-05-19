import { buildSVG } from './svgBuilder.js';
import JSZip from 'jszip';

export class ExportManager {
  constructor() {
    this.statusEl = null;
  }

  setupUI(statusEl) {
    this.statusEl = statusEl;
  }

  async exportZip(files, gridSize, selectedSizes, outlineEnabled, outlineColor, outlineThickness) {
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
        const svgContent = buildSVG(
          f.pixelData,
          gridSize,
          size,
          outlineEnabled,
          outlineColor,
          outlineThickness
        );
        folder.file(`${base}-${size}x${size}-${gridSize}grid.svg`, svgContent);
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
