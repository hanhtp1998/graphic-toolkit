export function buildHalftoneSVG(pixelData, gridW, gridH, outputSize, dotScale = 0.9, bgWhite = false) {
  const cell = outputSize / Math.max(gridW, gridH);
  const svgW = cell * gridW;
  const svgH = cell * gridH;
  const maxRadius = (cell / 2) * dotScale;

  let circles = '';
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const { r, g, b, a } = pixelData[y * gridW + x];
      if (a < 5) continue;
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      // Dark pixels → large dot, bright pixels → small dot
      const intensity = 1 - luminance / 255;
      const radius = maxRadius * intensity;
      if (radius < 0.3) continue;
      const cx = (x + 0.5) * cell;
      const cy = (y + 0.5) * cell;
      circles += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="rgb(${r},${g},${b})"/>`;
    }
  }

  const bg = bgWhite ? `<rect width="${svgW.toFixed(2)}" height="${svgH.toFixed(2)}" fill="white"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(2)}" height="${svgH.toFixed(2)}" viewBox="0 0 ${svgW.toFixed(2)} ${svgH.toFixed(2)}" shape-rendering="geometricPrecision">${bg}${circles}</svg>`;
}
