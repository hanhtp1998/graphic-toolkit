export function buildPointillismSVG(pixelData, gridW, gridH, outputSize, minR = 0.2, maxR = 0.9, bgWhite = true) {
  const cell = outputSize / Math.max(gridW, gridH);
  const svgW = cell * gridW;
  const svgH = cell * gridH;

  let circles = '';
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const { r, g, b, a } = pixelData[y * gridW + x];
      if (a < 5) continue;
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const brightness = luminance / 255;
      // Darker areas → larger circles, brighter areas → smaller circles
      const radiusFraction = minR + (1 - brightness) * (maxR - minR);
      const radius = (cell / 2) * radiusFraction;
      const cx = (x + 0.5) * cell;
      const cy = (y + 0.5) * cell;
      circles += `<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${radius.toFixed(2)}" fill="rgb(${r},${g},${b})" opacity="0.9"/>`;
    }
  }

  const bg = bgWhite ? `<rect width="${svgW.toFixed(2)}" height="${svgH.toFixed(2)}" fill="white"/>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW.toFixed(2)}" height="${svgH.toFixed(2)}" viewBox="0 0 ${svgW.toFixed(2)} ${svgH.toFixed(2)}" shape-rendering="geometricPrecision">${bg}${circles}</svg>`;
}
