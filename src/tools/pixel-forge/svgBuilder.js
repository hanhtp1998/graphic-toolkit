export function buildSVG(pixelData, gridW, gridH, outputSize, outlineEnabled, outlineColor, outlineThickness) {
  const cell = outputSize / Math.max(gridW, gridH);
  const pad = outlineEnabled ? cell * outlineThickness : 0;
  const svgW = cell * gridW + pad * 2;
  const svgH = cell * gridH + pad * 2;

  // Guard: pixelData must cover the full grid — bail with empty SVG if mismatched
  if (!pixelData || pixelData.length < gridW * gridH) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW.toFixed(2) + '" height="' + svgH.toFixed(2) + '" viewBox="0 0 ' + svgW.toFixed(2) + ' ' + svgH.toFixed(2) + '" shape-rendering="crispEdges"></svg>';
  }

  let rects = '';
  for (let y = 0; y < gridH; y++) {
    for (let x = 0; x < gridW; x++) {
      const { r, g, b, a } = pixelData[y * gridW + x];
      if (a < 5) continue;
      const opacity = a < 250 ? ' opacity="' + (a / 255).toFixed(3) + '"' : '';
      rects += '<rect x="' + (pad + x * cell).toFixed(2) + '" y="' + (pad + y * cell).toFixed(2) + '" width="' + cell.toFixed(2) + '" height="' + cell.toFixed(2) + '" fill="rgb(' + r + ',' + g + ',' + b + ')"' + opacity + '/>';
    }
  }

  let outline = '';
  if (outlineEnabled) {
    const isOpaque = (x, y) => x >= 0 && y >= 0 && x < gridW && y < gridH && pixelData[y * gridW + x].a >= 5;
    const bt = cell * outlineThickness;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        if (!isOpaque(x, y)) continue;
        const px = pad + x * cell;
        const py = pad + y * cell;

        if (!isOpaque(x, y - 1)) outline += '<rect x="' + px.toFixed(2) + '" y="' + (py - bt).toFixed(2) + '" width="' + cell.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x, y + 1)) outline += '<rect x="' + px.toFixed(2) + '" y="' + (py + cell).toFixed(2) + '" width="' + cell.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x - 1, y)) outline += '<rect x="' + (px - bt).toFixed(2) + '" y="' + py.toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + cell.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x + 1, y)) outline += '<rect x="' + (px + cell).toFixed(2) + '" y="' + py.toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + cell.toFixed(2) + '" fill="' + outlineColor + '"/>';

        if (!isOpaque(x - 1, y) && !isOpaque(x, y - 1)) outline += '<rect x="' + (px - bt).toFixed(2) + '" y="' + (py - bt).toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x + 1, y) && !isOpaque(x, y - 1)) outline += '<rect x="' + (px + cell).toFixed(2) + '" y="' + (py - bt).toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x - 1, y) && !isOpaque(x, y + 1)) outline += '<rect x="' + (px - bt).toFixed(2) + '" y="' + (py + cell).toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
        if (!isOpaque(x + 1, y) && !isOpaque(x, y + 1)) outline += '<rect x="' + (px + cell).toFixed(2) + '" y="' + (py + cell).toFixed(2) + '" width="' + bt.toFixed(2) + '" height="' + bt.toFixed(2) + '" fill="' + outlineColor + '"/>';
      }
    }
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgW.toFixed(2) + '" height="' + svgH.toFixed(2) + '" viewBox="0 0 ' + svgW.toFixed(2) + ' ' + svgH.toFixed(2) + '" shape-rendering="crispEdges">' + outline + rects + '</svg>';
}

export function extractPalette(pixelData) {
  const seen = {};
  pixelData.forEach(p => {
    if (p.a >= 5) {
      const key = p.r + ',' + p.g + ',' + p.b;
      seen[key] = (seen[key] || 0) + 1;
    }
  });
  return Object.entries(seen)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 32)
    .map(([key]) => key.split(',').map(Number));
}
