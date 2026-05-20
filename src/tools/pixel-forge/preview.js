import { buildSVG, extractPalette } from './svgBuilder.js';
import { buildHalftoneSVG } from './halftone.js';
import { buildPointillismSVG } from './pointillism.js';
import { buildAsciiSVG } from './ascii.js';

export class PreviewManager {
  constructor() {
    this.previewEl = null;
    this.paletteEl = null;
    this.tabsEl = null;
    this.activeIdx = 0;
    this.gridSize = 16;
    this.outlineEnabled = true;
    this.outlineColor = '#1a1612';
    this.outlineThickness = 1;
    this.activeEffect = 'pixel-art';
    this.effectSettings = {};
    this.onTabClick = null;
  }

  setupUI(previewEl, paletteEl, tabsEl) {
    this.previewEl = previewEl;
    this.paletteEl = paletteEl;
    this.tabsEl = tabsEl;

    tabsEl.addEventListener('click', (e) => {
      const tab = e.target.closest('.ptab');
      if (!tab || !this.onTabClick) return;
      this.onTabClick(parseInt(tab.dataset.idx));
    });
  }

  buildSVGForEffect(file, outputSize) {
    const { pixelData, gridW, gridH } = file;
    const s = this.effectSettings;
    switch (this.activeEffect) {
      case 'halftone':
        return buildHalftoneSVG(pixelData, gridW, gridH, outputSize, s.dotScale ?? 0.9, s.bgWhite ?? false);
      case 'pointillism':
        return buildPointillismSVG(pixelData, gridW, gridH, outputSize, s.minR ?? 0.2, s.maxR ?? 0.9, s.bgWhite ?? true);
      case 'ascii':
        return buildAsciiSVG(pixelData, gridW, gridH, outputSize, s.ramp, s.colorMode ?? 'mono');
      default:
        return buildSVG(pixelData, gridW, gridH, outputSize, this.outlineEnabled, this.outlineColor, this.outlineThickness);
    }
  }

  render(activeFile, allFiles) {
    if (!activeFile || !activeFile.pixelData) {
      this.previewEl.innerHTML = '<span class="empty-state">NO SIGNAL<br>──────────<br>LOAD IMAGE<br>TO START</span>';
      this.paletteEl.innerHTML = '';
      return;
    }

    // SVG content is generated entirely by our own builders — not user input
    this.previewEl.innerHTML = this.buildSVGForEffect(activeFile, 220); // safe: trusted source

    const palette = extractPalette(activeFile.pixelData);
    this.paletteEl.innerHTML = '<div class="pal-label">PALETTE (' + palette.length + ')</div>' +
      palette.map(([r, g, b]) =>
        '<div style="width:18px;height:18px;background:rgb(' + r + ',' + g + ',' + b + ');border:2px solid #1a1612;" title="rgb(' + r + ',' + g + ',' + b + ')"></div>'
      ).join('');

    this.renderTabs(allFiles);
  }

  renderTabs(allFiles) {
    if (!allFiles || allFiles.length <= 1) {
      this.tabsEl.innerHTML = '';
      return;
    }
    this.tabsEl.innerHTML = allFiles.map((f, i) =>
      '<div class="ptab' + (i === this.activeIdx ? ' active' : '') + '" data-idx="' + i + '" title="' + f.name + '">' + f.name + '</div>'
    ).join('');
  }

  clear() {
    this.previewEl.innerHTML = '<span class="empty-state">NO SIGNAL<br>──────────<br>LOAD IMAGE<br>TO START</span>';
    this.paletteEl.innerHTML = '';
    this.tabsEl.innerHTML = '';
  }
}
