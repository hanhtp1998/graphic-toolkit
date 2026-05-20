function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function applyContrast(pixels, contrastValue) {
  if (contrastValue === 0) return pixels;
  const f = (259 * (contrastValue + 255)) / (255 * (259 - contrastValue));
  return pixels.map(p =>
    p.a < 5 ? p : {
      r: Math.min(255, Math.max(0, Math.round(f * (p.r - 128) + 128))),
      g: Math.min(255, Math.max(0, Math.round(f * (p.g - 128) + 128))),
      b: Math.min(255, Math.max(0, Math.round(f * (p.b - 128) + 128))),
      a: p.a
    }
  );
}

export function quantizeColors(pixels, maxColors) {
  const opaque = pixels.filter(p => p.a >= 5);
  if (!opaque.length) return pixels;

  let buckets = [opaque.map(p => [p.r, p.g, p.b])];
  while (buckets.length < maxColors) {
    let bestIdx = 0, bestRange = -1;
    buckets.forEach((b, i) => {
      const range = Math.max(...[0, 1, 2].map(ch => Math.max(...b.map(c => c[ch])) - Math.min(...b.map(c => c[ch]))));
      if (range > bestRange) { bestRange = range; bestIdx = i; }
    });
    if (bestRange === 0) break;

    const bucket = buckets[bestIdx];
    const channel = [0, 1, 2].reduce((best, c) => {
      const r = Math.max(...bucket.map(x => x[c])) - Math.min(...bucket.map(x => x[c]));
      return r > ([0, 1, 2].map(cc => Math.max(...bucket.map(x => x[cc])) - Math.min(...bucket.map(x => x[cc])))[best] || 0) ? c : best;
    }, 0);

    bucket.sort((a, b) => a[channel] - b[channel]);
    const mid = Math.floor(bucket.length / 2);
    buckets.splice(bestIdx, 1, bucket.slice(0, mid), bucket.slice(mid));
  }

  const palette = buckets.map(b => [0, 1, 2].map(ch => Math.round(b.reduce((s, c) => s + c[ch], 0) / b.length)));
  return pixels.map(p => {
    if (p.a < 5) return p;
    let best = 0, bestDist = Infinity;
    palette.forEach(([r, g, b], i) => {
      const d = colorDist(p.r, p.g, p.b, r, g, b);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return { r: palette[best][0], g: palette[best][1], b: palette[best][2], a: p.a };
  });
}

export function removeBackground(pixels, gridW, gridH, tolerance) {
  if (tolerance === 0) return pixels;
  const corners = [
    pixels[0],
    pixels[gridW - 1],
    pixels[(gridH - 1) * gridW],
    pixels[gridH * gridW - 1]
  ];
  let br = 0, bg = 0, bb = 0, count = 0;

  corners.forEach(p => {
    if (p.a > 200) { br += p.r; bg += p.g; bb += p.b; count++; }
  });

  if (!count) return pixels;
  br = Math.round(br / count);
  bg = Math.round(bg / count);
  bb = Math.round(bb / count);

  return pixels.map(p =>
    p.a < 5 ? p : colorDist(p.r, p.g, p.b, br, bg, bb) < tolerance ? { ...p, a: 0 } : p
  );
}

export function processImage(imageDataUrl, gridSize, contrast, maxColors, bgTolerance, squareMode = false) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let gridW, gridH;
      if (squareMode) {
        gridW = gridSize;
        gridH = gridSize;
      } else {
        const aspect = img.naturalWidth / img.naturalHeight;
        if (aspect >= 1) {
          gridW = gridSize;
          gridH = Math.max(1, Math.round(gridSize / aspect));
        } else {
          gridH = gridSize;
          gridW = Math.max(1, Math.round(gridSize * aspect));
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = gridW;
      canvas.height = gridH;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, gridW, gridH);

      try {
        const imgData = ctx.getImageData(0, 0, gridW, gridH).data;
        let pixels = [];
        for (let i = 0; i < gridW * gridH; i++) {
          pixels.push({
            r: imgData[i * 4],
            g: imgData[i * 4 + 1],
            b: imgData[i * 4 + 2],
            a: imgData[i * 4 + 3]
          });
        }

        pixels = applyContrast(pixels, contrast);
        pixels = quantizeColors(pixels, maxColors);
        pixels = removeBackground(pixels, gridW, gridH, bgTolerance);

        // Generate 36x36 thumbnail
        canvas.width = 36;
        canvas.height = 36;
        ctx.drawImage(img, 0, 0, 36, 36);
        const thumbnail = canvas.toDataURL();

        resolve({ pixelData: pixels, thumbnail, gridW, gridH });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}
