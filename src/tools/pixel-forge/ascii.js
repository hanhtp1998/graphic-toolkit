export const RAMPS = {
  balanced: ' .:-=+*#%@',
  dense:    ' ░▒▓█',
  minimal:  ' .+#',
};

export function buildAsciiSVG(pixelData, gridW, gridH, outputSize, ramp = RAMPS.balanced, colorMode = 'mono') {
  const cell = outputSize / Math.max(gridW, gridH);
  const svgW = cell * gridW;
  const svgH = cell * gridH;
  const fontSize = cell * 0.9;

  let texts = '';
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const { r, g, b, a } = pixelData[y * gridW + x];
      if (a < 5) continue;
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const charIdx = Math.floor(luminance * (ramp.length - 1));
      const char = ramp[charIdx];
      if (char === ' ') continue;
      const cx = (x + 0.5) * cell;
      const cy = (y + 0.5) * cell;
      const fill = colorMode === 'color' ? `rgb(${r},${g},${b})` : '#1a1612';
      const escaped = char === '&' ? '&amp;' : char === '<' ? '&lt;' : char;
      texts += `<text x="${cx.toFixed(2)}" y="${cy.toFixed(2)}" font-family="monospace" font-size="${fontSize.toFixed(2)}" text-anchor="middle" dominant-baseline="central" fill="${fill}">${escaped}</text>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(2)}" height="${svgH.toFixed(2)}" viewBox="0 0 ${svgW.toFixed(2)} ${svgH.toFixed(2)}">${texts}</svg>`;
}
