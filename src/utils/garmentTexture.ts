import * as THREE from 'three';
import type { GarmentAppearance, GarmentVisualKind, ProductSpec } from '../data/catalog';

export const BRAND_LOGO_SOURCE_URL =
  '/assets/aistudio/188527755_182029527145490_1195137052679486377_n_76a9bf00.jpg';

const imageCache = new Map<string, Promise<HTMLImageElement>>();
const previewUrlCache = new Map<string, string>();
const cutoutCanvasCache = new Map<
  string,
  Promise<{ garmentCanvas: HTMLCanvasElement; shadowCanvas: HTMLCanvasElement }>
>();

let logoAssetsPromise: Promise<{
  fullLogoCanvas: HTMLCanvasElement;
  emblemCanvas: HTMLCanvasElement;
  fullLogoUrl: string;
  emblemUrl: string;
}> | null = null;

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  const existing = imageCache.get(src);
  if (existing) return existing;

  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
  imageCache.set(src, promise);
  return promise;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.replace(/(.)/g, '$1$1') : clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      case bn:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  let tt = t;
  if (tt < 0) tt += 1;
  if (tt > 1) tt -= 1;
  if (tt < 1 / 6) return p + (q - p) * 6 * tt;
  if (tt < 1 / 2) return q;
  if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
  return p;
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/**
 * Loads the user's attached THUMB SPORTS INDUSTRIES logo and cleanly removes its dark background
 * using border flood-fill + interior dark pocket removal + edge color decontamination.
 */
export function getThumbLogoAssets() {
  if (logoAssetsPromise) return logoAssetsPromise;

  logoAssetsPromise = (async () => {
    const img = await loadHtmlImage(BRAND_LOGO_SOURCE_URL);
    const w = img.naturalWidth || 300;
    const h = img.naturalHeight || 300;

    const fullLogoCanvas = document.createElement('canvas');
    fullLogoCanvas.width = w;
    fullLogoCanvas.height = h;
    const ctx = fullLogoCanvas.getContext('2d', { willReadFrequently: true })!;
    ctx.drawImage(img, 0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    const total = w * h;
    const isBg = new Uint8Array(total);
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let qHead = 0;
    let qTail = 0;

    const canBeDarkBg = (idx: number): boolean => {
      const p = idx * 4;
      const r = d[p];
      const g = d[p + 1];
      const b = d[p + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      // Dark background has low luminance and very low color saturation
      return lum < 84 && sat < 26;
    };

    const enqueue = (idx: number) => {
      if (visited[idx]) return;
      visited[idx] = 1;
      if (canBeDarkBg(idx)) {
        isBg[idx] = 1;
        queue[qTail++] = idx;
      }
    };

    // Seed from perimeter + interior dark openings inside the metallic oval and wordmark
    for (let x = 0; x < w; x++) {
      enqueue(x);
      enqueue((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      enqueue(y * w);
      enqueue(y * w + (w - 1));
    }
    // Seed interior enclosed pockets inside the oval & around text
    for (let y = Math.round(h * 0.12); y < h - 4; y += 3) {
      for (let x = Math.round(w * 0.15); x < Math.round(w * 0.85); x += 3) {
        const idx = y * w + x;
        const p = idx * 4;
        const lum = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
        const sat = Math.max(d[p], d[p + 1], d[p + 2]) - Math.min(d[p], d[p + 1], d[p + 2]);
        if (lum < 58 && sat < 18) {
          enqueue(idx);
        }
      }
    }

    while (qHead < qTail) {
      const cur = queue[qHead++];
      const cx = cur % w;
      const cy = (cur - cx) / w;
      const neighbors = [
        cx > 0 ? cur - 1 : -1,
        cx < w - 1 ? cur + 1 : -1,
        cy > 0 ? cur - w : -1,
        cy < h - 1 ? cur + w : -1,
      ];
      for (let n = 0; n < 4; n++) {
        const ni = neighbors[n];
        if (ni >= 0 && !visited[ni]) enqueue(ni);
      }
    }

    // Apply alpha & lift dark fringe pixels along edges
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      if (isBg[i]) {
        d[p + 3] = 0;
        continue;
      }
      const r = d[p];
      const g = d[p + 1];
      const b = d[p + 2];
      const lum = r * 0.299 + g * 0.587 + b * 0.114;
      const sat = Math.max(r, g, b) - Math.min(r, g, b);

      const x = i % w;
      const y = (i - x) / w;
      const touchesBg =
        (x > 0 && isBg[i - 1]) ||
        (x < w - 1 && isBg[i + 1]) ||
        (y > 0 && isBg[i - w]) ||
        (y < h - 1 && isBg[i + w]);

      if (touchesBg && lum < 105 && sat < 32) {
        d[p + 3] = Math.round(Math.max(0, Math.min(200, (lum - 45) * 3.2)));
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Crop upper oval emblem cleanly (top 69% contains the metallic TS ring)
    const embW = Math.round(w * 0.72);
    const embH = Math.round(h * 0.66);
    const emblemCanvas = document.createElement('canvas');
    emblemCanvas.width = embW;
    emblemCanvas.height = embH;
    const eCtx = emblemCanvas.getContext('2d')!;
    eCtx.drawImage(
      fullLogoCanvas,
      Math.round(w * 0.14),
      Math.round(h * 0.03),
      embW,
      embH,
      0,
      0,
      embW,
      embH,
    );

    return {
      fullLogoCanvas,
      emblemCanvas,
      fullLogoUrl: fullLogoCanvas.toDataURL('image/png'),
      emblemUrl: emblemCanvas.toDataURL('image/png'),
    };
  })();

  return logoAssetsPromise;
}

function appearanceKey(appearance?: GarmentAppearance): string {
  if (!appearance) return 'base';
  return [
    appearance.softTintHex || '',
    appearance.hueShiftDeg ?? '',
    appearance.satScale ?? '',
    appearance.lightScale ?? '',
    appearance.patternStyle || 'none',
    appearance.accentHex || '',
  ].join(':');
}

function cloneTexturedPatch(
  ctx: CanvasRenderingContext2D,
  srcX: number,
  srcY: number,
  dstX: number,
  dstY: number,
  w: number,
  h: number,
  radius = 6,
) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(dstX, dstY, w, h, radius);
  ctx.clip();
  ctx.drawImage(ctx.canvas, srcX, srcY, w, h, dstX, dstY, w, h);
  ctx.restore();
}

/**
 * Cleans third-party placeholder marks on the cobalt match jersey using neighboring
 * textured mesh pixels so the athletic pinhole weave stays 100% natural.
 */
function cleanJerseyThirdPartyMarks(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  // Right chest emblem -> clone clean cobalt mesh just below it
  cloneTexturedPatch(
    ctx,
    width * 0.352,
    height * 0.408,
    width * 0.352,
    height * 0.33,
    width * 0.088,
    height * 0.072,
    8,
  );
  // Center sponsor text -> clone clean cobalt torso mesh from lower torso
  cloneTexturedPatch(
    ctx,
    width * 0.365,
    height * 0.525,
    width * 0.365,
    height * 0.442,
    width * 0.275,
    height * 0.076,
    10,
  );
  // Sleeve number mark -> clone clean white sleeve mesh beside it
  cloneTexturedPatch(
    ctx,
    width * 0.785,
    height * 0.34,
    width * 0.78,
    height * 0.388,
    width * 0.088,
    height * 0.056,
    6,
  );
  // Left chest text -> soft cobalt-white feathered blend from adjacent shoulder mesh
  cloneTexturedPatch(
    ctx,
    width * 0.56,
    height * 0.265,
    width * 0.542,
    height * 0.344,
    width * 0.135,
    height * 0.056,
    8,
  );
}

/**
 * Cleans the small sleeve print on the chalk/charcoal windbreaker photo using adjacent chalk Taslan.
 */
function cleanWindbreakerSleeveMark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  cloneTexturedPatch(
    ctx,
    width * 0.77,
    height * 0.345,
    width * 0.768,
    height * 0.415,
    width * 0.082,
    height * 0.068,
    8,
  );
}

function clampByte(v: number): number {
  return v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
}

/**
 * Composites a transparent logo canvas INTO real garment cloth pixels:
 * - Masks strictly inside existing cloth alpha (never bleeds off edges)
 * - Displaces pixels subtly along local fabric fold luminance gradients so the mark wraps curves
 * - Modulates brightness by local fold shadow & fabric weave micro-texture (zero flat sticker drop-shadow!)
 */
function compositeLogoIntoFabric(
  ctx: CanvasRenderingContext2D,
  logoCanvas: HTMLCanvasElement,
  canvasW: number,
  canvasH: number,
  cx: number,
  cy: number,
  drawW: number,
  opacity = 0.92,
  warpStrength = 1.6,
  weaveBleed = 0.35,
  rotateDeg = 0,
) {
  const drawH = drawW * (logoCanvas.height / logoCanvas.width);
  const x0 = Math.max(0, Math.round(cx - drawW / 2));
  const y0 = Math.max(0, Math.round(cy - drawH / 2));
  const lw = Math.min(canvasW - x0, Math.max(4, Math.round(drawW)));
  const lh = Math.min(canvasH - y0, Math.max(4, Math.round(drawH)));
  if (lw <= 2 || lh <= 2) return;

  const clothData = ctx.getImageData(x0, y0, lw, lh);
  const cArr = clothData.data;

  // Sample logo into exact target box (with optional surface angle rotation)
  const tmpLogo = document.createElement('canvas');
  tmpLogo.width = lw;
  tmpLogo.height = lh;
  const lCtx = tmpLogo.getContext('2d', { willReadFrequently: true })!;
  lCtx.imageSmoothingEnabled = true;
  lCtx.imageSmoothingQuality = 'high';
  if (rotateDeg !== 0) {
    lCtx.save();
    lCtx.translate(lw / 2, lh / 2);
    lCtx.rotate((rotateDeg * Math.PI) / 180);
    lCtx.drawImage(logoCanvas, -lw * 0.46, -lh * 0.46, lw * 0.92, lh * 0.92);
    lCtx.restore();
  } else {
    lCtx.drawImage(logoCanvas, 0, 0, lw, lh);
  }
  const lArr = lCtx.getImageData(0, 0, lw, lh).data;

  // Compute local luminance map & average cloth luminance
  const lumMap = new Float32Array(lw * lh);
  let lumSum = 0;
  let lumCount = 0;
  for (let i = 0; i < lw * lh; i++) {
    const p = i * 4;
    const l = cArr[p] * 0.299 + cArr[p + 1] * 0.587 + cArr[p + 2] * 0.114;
    lumMap[i] = l;
    if (cArr[p + 3] > 180) {
      lumSum += l;
      lumCount++;
    }
  }
  if (lumCount === 0) return;
  const meanLum = lumSum / lumCount;

  // Box-smooth luminance (3x3) to separate macro folds from micro weave grain
  const smoothLum = new Float32Array(lw * lh);
  for (let y = 0; y < lh; y++) {
    for (let x = 0; x < lw; x++) {
      let acc = 0;
      let cnt = 0;
      for (let oy = -2; oy <= 2; oy++) {
        const sy = y + oy;
        if (sy < 0 || sy >= lh) continue;
        for (let ox = -2; ox <= 2; ox++) {
          const sx = x + ox;
          if (sx < 0 || sx >= lw) continue;
          acc += lumMap[sy * lw + sx];
          cnt++;
        }
      }
      smoothLum[y * lw + x] = acc / cnt;
    }
  }

  for (let y = 0; y < lh; y++) {
    const yUp = Math.max(0, y - 2);
    const yDn = Math.min(lh - 1, y + 2);
    for (let x = 0; x < lw; x++) {
      const idx = y * lw + x;
      const p = idx * 4;
      const clothA = cArr[p + 3];
      if (clothA < 150) continue;

      const xLt = Math.max(0, x - 2);
      const xRt = Math.min(lw - 1, x + 2);
      const gx = (smoothLum[y * lw + xRt] - smoothLum[y * lw + xLt]) / 255;
      const gy = (smoothLum[yDn * lw + x] - smoothLum[yUp * lw + x]) / 255;

      // Displace source sample coordinate softly across wrinkles/creases
      const sx = Math.min(lw - 1, Math.max(0, Math.round(x - gx * warpStrength * 4.5)));
      const sy = Math.min(lh - 1, Math.max(0, Math.round(y - gy * warpStrength * 4.5)));
      const lp = (sy * lw + sx) * 4;
      const logoA = lArr[lp + 3];
      if (logoA < 8) continue;

      const foldRel = (smoothLum[idx] - meanLum) / Math.max(48, meanLum);
      const foldShade = Math.max(0.52, Math.min(1.16, 0.96 + foldRel * 0.85));
      const microWeave = (lumMap[idx] - smoothLum[idx]) * weaveBleed;

      const lr = clampByte(lArr[lp] * foldShade + microWeave);
      const lg = clampByte(lArr[lp + 1] * foldShade + microWeave);
      const lb = clampByte(lArr[lp + 2] * foldShade + microWeave);

      const alpha = (logoA / 255) * opacity * Math.min(1, clothA / 235);
      cArr[p] = clampByte(cArr[p] * (1 - alpha) + lr * alpha);
      cArr[p + 1] = clampByte(cArr[p + 1] * (1 - alpha) + lg * alpha);
      cArr[p + 2] = clampByte(cArr[p + 2] * (1 - alpha) + lb * alpha);
    }
  }

  ctx.putImageData(clothData, x0, y0);
}

/**
 * Places the background-removed THUMB SPORTS emblem anatomically onto each garment's real cloth
 * so it wraps folds, absorbs shadows, and reveals fabric grain naturally (no pasted sticker look).
 */
function stampThumbBrandOnGarment(
  ctx: CanvasRenderingContext2D,
  emblemCanvas: HTMLCanvasElement,
  fullLogoCanvas: HTMLCanvasElement,
  kind: GarmentVisualKind,
  basePhoto: string,
  width: number,
  height: number,
) {
  if (kind === 'jersey-match') {
    // Realistic embroidered match crest positioned on right chest inside cobalt panel
    compositeLogoIntoFabric(
      ctx,
      emblemCanvas,
      width,
      height,
      width * 0.398,
      height * 0.365,
      width * 0.056,
      0.95,
      1.4,
      0.4,
    );
    // Clean center front Thumb Sports full lockup woven into the jersey mesh
    compositeLogoIntoFabric(
      ctx,
      fullLogoCanvas,
      width,
      height,
      width * 0.502,
      height * 0.482,
      width * 0.145,
      0.92,
      1.8,
      0.45,
    );
    return;
  }

  if (kind === 'drawstring-bag') {
    // Screenprinted metallic crest & wordmark centered on nylon ripstop bag (grid shows through!)
    compositeLogoIntoFabric(
      ctx,
      fullLogoCanvas,
      width,
      height,
      width * 0.502,
      height * 0.495,
      width * 0.185,
      0.9,
      2.2,
      0.52,
    );
    return;
  }

  if (kind === 'sweatsuit-set') {
    const isMochaPhoto = basePhoto.includes('mens_sweatsuit_mocha');
    if (isMochaPhoto) {
      // Mocha set: left shoulder chest corner above pants hanger + left thigh of draped joggers
      compositeLogoIntoFabric(
        ctx,
        emblemCanvas,
        width,
        height,
        width * 0.625,
        height * 0.252,
        width * 0.044,
        0.9,
        1.5,
        0.42,
      );
      compositeLogoIntoFabric(
        ctx,
        emblemCanvas,
        width,
        height,
        width * 0.425,
        height * 0.425,
        width * 0.044,
        0.9,
        1.5,
        0.42,
      );
    } else {
      // Coral set: open coral upper chest above wood bar + left hip of joggers
      compositeLogoIntoFabric(
        ctx,
        emblemCanvas,
        width,
        height,
        width * 0.618,
        height * 0.222,
        width * 0.04,
        0.9,
        1.4,
        0.42,
      );
      compositeLogoIntoFabric(
        ctx,
        emblemCanvas,
        width,
        height,
        width * 0.415,
        height * 0.448,
        width * 0.046,
        0.9,
        1.5,
        0.42,
      );
    }
    return;
  }

  if (kind === 'sports-kit') {
    // High-chest center emblem on crop + subtle left-thigh badge on matching bike shorts
    compositeLogoIntoFabric(
      ctx,
      emblemCanvas,
      width,
      height,
      width * 0.46,
      height * 0.39,
      width * 0.044,
      0.92,
      1.3,
      0.38,
    );
    compositeLogoIntoFabric(
      ctx,
      emblemCanvas,
      width,
      height,
      width * 0.695,
      height * 0.56,
      width * 0.038,
      0.9,
      1.3,
      0.38,
    );
    return;
  }

  // Exact anatomical cloth coordinates for remaining single garments
  let cx = width * 0.602;
  let cy = height * 0.348;
  let logoScale = 0.048;

  if (kind === 'spats-compression') {
    cx = width * 0.6;
    cy = height * 0.295;
    logoScale = 0.044;
  } else if (kind === 'cargo-ripstop' || kind === 'cargo-carpenter') {
    cx = width * 0.675;
    cy = height * 0.38;
    logoScale = 0.046;
  } else if (kind === 'puffer-jacket') {
    // Cleanly inside left-chest dark charcoal shoulder yoke
    cx = width * 0.606;
    cy = height * 0.285;
    logoScale = 0.047;
  } else if (kind === 'track-windbreaker' || kind === 'track-shell') {
    cx = width * 0.605;
    cy = height * 0.318;
    logoScale = 0.047;
  } else if (kind === 'hoodie-pullover' || kind === 'hoodie-zip') {
    cx = width * 0.6;
    cy = height * 0.352;
    logoScale = 0.047;
  } else if (kind === 'crewneck') {
    cx = width * 0.602;
    cy = height * 0.305;
    logoScale = 0.047;
  } else if (kind === 'jiujitsu-gi') {
    cx = width * 0.618;
    cy = height * 0.382;
    logoScale = 0.048;
  } else if (kind === 'tee-boxy' || kind === 'tee-acid') {
    cx = width * 0.598;
    cy = height * 0.342;
    logoScale = 0.045;
  } else if (kind === 'jacket-bomber' || kind === 'jacket-workwear') {
    cx = width * 0.604;
    cy = height * 0.335;
    logoScale = 0.047;
  }

  compositeLogoIntoFabric(
    ctx,
    emblemCanvas,
    width,
    height,
    cx,
    cy,
    width * logoScale,
    0.92,
    1.6,
    0.4,
  );
}

/**
 * Full-HD (900x1200) garment cutout & photographic finishing pipeline:
 * 1. Removes studio backdrop + interior gaps with 2-pass edge fringe decontamination -> ZERO white outline!
 * 2. Keeps primary studio garments 100% authentic and un-distorted (no painted stripes)
 * 3. Integrates the Thumb Sports Industries logo directly into the fabric folds & weave
 * 4. Produces a soft wall drop shadow silhouette
 */
async function buildCutoutAndShadow(
  kind: GarmentVisualKind,
  basePhoto: string,
  hookYRatio: number,
  appearance: GarmentAppearance = {},
  width = 900,
  height = 1200,
): Promise<{ garmentCanvas: HTMLCanvasElement; shadowCanvas: HTMLCanvasElement }> {
  const cacheKey = `${kind}|${basePhoto}|${hookYRatio}|${appearanceKey(appearance)}|${width}x${height}`;
  const existing = cutoutCanvasCache.get(cacheKey);
  if (existing) return existing;

  const task = (async () => {
    const [img, logoAssets] = await Promise.all([
      loadHtmlImage(basePhoto),
      getThumbLogoAssets(),
    ]);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const targetHookY = 0.065;
    const shiftY = Math.round((targetHookY - hookYRatio) * height);
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, shiftY, width, height);

    if (kind === 'jersey-match') {
      cleanJerseyThirdPartyMarks(ctx, width, height);
    } else if (basePhoto.includes('real_trackjacket_hanger')) {
      cleanWindbreakerSleeveMark(ctx, width, height);
    }

    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    // Mask out vertical window frame edge on left of cyan-amber track jacket photo
    if (basePhoto.includes('mens_jacket_cyan_amber')) {
      const cropLeft = Math.round(width * 0.056);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < cropLeft; x++) {
          d[(y * width + x) * 4 + 3] = 0;
        }
      }
    }

    // Mask out horizontal top rod & floor strip on match jersey photo
    if (kind === 'jersey-match') {
      const rodMaxY = Math.round(height * 0.105);
      const hookMinX = Math.round(width * 0.455);
      const hookMaxX = Math.round(width * 0.545);
      for (let y = 0; y < rodMaxY; y++) {
        for (let x = 0; x < width; x++) {
          if (x < hookMinX || x > hookMaxX) {
            d[(y * width + x) * 4 + 3] = 0;
          }
        }
      }
      const floorStartY = Math.round(height * 0.855);
      for (let y = floorStartY; y < height; y++) {
        for (let x = 0; x < width; x++) {
          d[(y * width + x) * 4 + 3] = 0;
        }
      }
    }

    const total = width * height;
    const lumBuf = new Float32Array(total);
    for (let i = 0; i < total; i++) {
      const p = i * 4;
      lumBuf[i] = d[p] * 0.299 + d[p + 1] * 0.587 + d[p + 2] * 0.114;
    }

    // Precompute Sobel gradient magnitude & 3x3 local luminance range to detect real garment seams/cuffs vs smooth wall shadow
    const sobel = new Float32Array(total);
    const localRange = new Float32Array(total);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const gx =
          lumBuf[idx + 1] -
          lumBuf[idx - 1] +
          0.5 * (lumBuf[idx - width + 1] - lumBuf[idx - width - 1]) +
          0.5 * (lumBuf[idx + width + 1] - lumBuf[idx + width - 1]);
        const gy =
          lumBuf[idx + width] -
          lumBuf[idx - width] +
          0.5 * (lumBuf[idx + width - 1] - lumBuf[idx - width - 1]) +
          0.5 * (lumBuf[idx + width + 1] - lumBuf[idx - width + 1]);
        sobel[idx] = Math.hypot(gx, gy);

        let mn = 255;
        let mx = 0;
        for (let oy = -1; oy <= 1; oy++) {
          const row = (y + oy) * width + x;
          for (let ox = -1; ox <= 1; ox++) {
            const v = lumBuf[row + ox];
            if (v < mn) mn = v;
            if (v > mx) mx = v;
          }
        }
        localRange[idx] = mx - mn;
      }
    }

    // Measure smooth vertical left/right studio backdrop baseline per row
    const leftEdgeX = basePhoto.includes('mens_jacket_cyan_amber')
      ? Math.round(width * 0.068)
      : 6;
    const rightEdgeX = width - 7;
    const rowWallR = new Float32Array(height);
    const rowWallG = new Float32Array(height);
    const rowWallB = new Float32Array(height);
    const rowWallLum = new Float32Array(height);

    let fallbackR = 212;
    let fallbackG = 212;
    let fallbackB = 208;
    for (let y = 0; y < height; y++) {
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      let cnt = 0;
      for (const sx of [leftEdgeX, leftEdgeX + 4, rightEdgeX - 4, rightEdgeX]) {
        const p = (y * width + sx) * 4;
        if (d[p + 3] > 200) {
          sumR += d[p];
          sumG += d[p + 1];
          sumB += d[p + 2];
          cnt++;
        }
      }
      if (cnt > 0) {
        fallbackR = sumR / cnt;
        fallbackG = sumG / cnt;
        fallbackB = sumB / cnt;
      }
      rowWallR[y] = fallbackR;
      rowWallG[y] = fallbackG;
      rowWallB[y] = fallbackB;
      rowWallLum[y] = fallbackR * 0.299 + fallbackG * 0.587 + fallbackB * 0.114;
    }

    const isBg = new Uint8Array(total);
    const visited = new Uint8Array(total);
    const queue = new Int32Array(total);
    let qHead = 0;
    let qTail = 0;

    // Chroma deviation from local studio wall baseline:
    // Cast wall shadows keep R,G,B balanced (chromaDiff <= 9) while cream/colored fabrics spike!
    const getWallStats = (idx: number) => {
      const p = idx * 4;
      const y = (idx - (idx % width)) / width;
      const r = d[p];
      const g = d[p + 1];
      const b = d[p + 2];
      const wR = rowWallR[y];
      const wG = rowWallG[y];
      const wB = rowWallB[y];
      const dR = r - wR;
      const dG = g - wG;
      const dB = b - wB;
      const chromaDiff = Math.max(Math.abs(dR - dG), Math.abs(dG - dB), Math.abs(dR - dB));
      const sat = Math.max(r, g, b) - Math.min(r, g, b);
      const lum = lumBuf[idx];
      const wLum = rowWallLum[y];
      return { r, g, b, wR, wG, wB, chromaDiff, sat, lum, wLum };
    };

    const canBeBackground = (idx: number, strict = false): boolean => {
      const p = idx * 4;
      if (d[p + 3] < 40) return true;
      const { r, b, chromaDiff, sat, lum, wLum } = getWallStats(idx);

      // Protect warm cream/ivory cuffs, collars & drawstrings (warm R-B spread or chroma shift)
      if (r - b >= 11 || chromaDiff > 10) return false;

      if (strict) {
        return (
          lum > 148 &&
          lum <= wLum + 18 &&
          sat <= 12 &&
          chromaDiff <= 8 &&
          sobel[idx] < 16 &&
          localRange[idx] < 12
        );
      }

      // Allow clean wall + smooth studio wall shadows while stopping on seams/bright white garments
      return (
        lum >= 88 &&
        lum <= wLum + 18 &&
        sat <= 15 &&
        chromaDiff <= 10 &&
        sobel[idx] < 22 &&
        localRange[idx] < 17
      );
    };

    const enqueue = (idx: number, strict = false) => {
      if (visited[idx]) return;
      visited[idx] = 1;
      if (canBeBackground(idx, strict)) {
        isBg[idx] = 1;
        queue[qTail++] = idx;
      }
    };

    // Perimeter seeds
    for (let x = 0; x < width; x++) {
      enqueue(x);
      enqueue((height - 1) * width + x);
      if (shiftY > 0 && shiftY < height) {
        enqueue(shiftY * width + x);
      }
      if (kind === 'jersey-match') {
        enqueue(Math.round(height * 0.11) * width + x);
        enqueue(Math.round(height * 0.85) * width + x);
      }
    }
    for (let y = 0; y < height; y++) {
      enqueue(y * width);
      enqueue(y * width + (width - 1));
      if (basePhoto.includes('mens_jacket_cyan_amber')) {
        enqueue(y * width + Math.round(width * 0.062));
      }
    }

    // Targeted interior pocket seeds (hanger neck gap, leg gaps, crop-top underarm) with strict checks
    for (let y = Math.round(height * 0.05); y < Math.round(height * 0.155); y += 2) {
      for (let x = Math.round(width * 0.45); x <= Math.round(width * 0.55); x += 2) {
        enqueue(y * width + x, true);
      }
    }
    if (
      kind === 'cargo-ripstop' ||
      kind === 'cargo-carpenter' ||
      kind === 'spats-compression' ||
      kind === 'jiujitsu-gi' ||
      (kind === 'sweatsuit-set' && !basePhoto.includes('mens_sweatsuit_mocha'))
    ) {
      for (let y = Math.round(height * 0.64); y < Math.round(height * 0.88); y += 3) {
        for (let x = Math.round(width * 0.465); x <= Math.round(width * 0.535); x += 2) {
          enqueue(y * width + x, true);
        }
      }
    }
    if (kind === 'sports-kit') {
      for (let y = Math.round(height * 0.25); y < Math.round(height * 0.44); y += 3) {
        for (let x = Math.round(width * 0.34); x <= Math.round(width * 0.66); x += 3) {
          enqueue(y * width + x, true);
        }
      }
    }

    // Stage 1: Perimeter flood-fill across studio backdrop
    while (qHead < qTail) {
      const cur = queue[qHead++];
      const cx = cur % width;
      const cy = (cur - cx) / width;
      const curLum = lumBuf[cur];

      const neighbors = [
        cx > 0 ? cur - 1 : -1,
        cx < width - 1 ? cur + 1 : -1,
        cy > 0 ? cur - width : -1,
        cy < height - 1 ? cur + width : -1,
      ];

      for (let n = 0; n < 4; n++) {
        const ni = neighbors[n];
        if (ni < 0 || visited[ni]) continue;
        const np = ni * 4;
        if (d[np + 3] < 40) {
          visited[ni] = 1;
          isBg[ni] = 1;
          queue[qTail++] = ni;
          continue;
        }
        const lumStep = Math.abs(lumBuf[ni] - curLum);
        if (lumStep < 14 && canBeBackground(ni)) {
          visited[ni] = 1;
          isBg[ni] = 1;
          queue[qTail++] = ni;
        } else {
          visited[ni] = 1;
        }
      }
    }

    // Stage 2: Smooth Wall-Shadow Cleaner — sweeps remaining soft drop shadows touching isBg
    // without touching textured fabric, cuffs, or garment edges
    const shadowQueue = new Int32Array(total);
    let sqHead = 0;
    let sqTail = 0;
    const sVisited = new Uint8Array(total);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (isBg[idx]) continue;
        if (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - width] || isBg[idx + width]) {
          sVisited[idx] = 1;
          const { r, b, chromaDiff, sat, lum, wLum } = getWallStats(idx);
          if (
            r - b <= 9 &&
            chromaDiff <= 9 &&
            sat <= 12 &&
            lum >= 76 &&
            lum <= wLum + 8 &&
            sobel[idx] < 17 &&
            localRange[idx] < 14
          ) {
            isBg[idx] = 1;
            shadowQueue[sqTail++] = idx;
          }
        }
      }
    }

    while (sqHead < sqTail) {
      const cur = shadowQueue[sqHead++];
      const cx = cur % width;
      const cy = (cur - cx) / width;
      const curLum = lumBuf[cur];

      const neighbors = [
        cx > 0 ? cur - 1 : -1,
        cx < width - 1 ? cur + 1 : -1,
        cy > 0 ? cur - width : -1,
        cy < height - 1 ? cur + width : -1,
      ];

      for (let n = 0; n < 4; n++) {
        const ni = neighbors[n];
        if (ni < 0 || isBg[ni] || sVisited[ni]) continue;
        sVisited[ni] = 1;
        const { r, b, chromaDiff, sat, lum, wLum } = getWallStats(ni);
        if (
          Math.abs(lum - curLum) <= 9 &&
          r - b <= 9 &&
          chromaDiff <= 9 &&
          sat <= 12 &&
          lum >= 76 &&
          lum <= wLum + 8 &&
          sobel[ni] < 16 &&
          localRange[ni] < 13
        ) {
          isBg[ni] = 1;
          shadowQueue[sqTail++] = ni;
        }
      }
    }

    // Stage 3: Clean isolated 1px speckles & erode bright neutral border fringe (zero halo!)
    const isHalo = new Uint8Array(total);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (isBg[idx]) continue;
        const bgNeighbors =
          isBg[idx - 1] + isBg[idx + 1] + isBg[idx - width] + isBg[idx + width];
        if (bgNeighbors === 0) continue;
        if (bgNeighbors >= 3) {
          isHalo[idx] = 1;
          continue;
        }
        const { r, b, chromaDiff, sat, lum, wLum } = getWallStats(idx);
        if (r - b <= 10 && chromaDiff <= 11 && sat <= 14 && lum <= wLum + 16) {
          isHalo[idx] = 1;
        }
      }
    }

    const softTint = appearance.softTintHex ? hexToRgb(appearance.softTintHex) : null;
    const softTintHsl = softTint ? rgbToHsl(softTint.r, softTint.g, softTint.b) : null;
    const hueShiftDeg = appearance.hueShiftDeg;
    const satScale = appearance.satScale ?? 1;
    const lightScale = appearance.lightScale ?? 1;

    const hangerCutoffY = Math.round(height * 0.145);
    const isColorblock =
      kind === 'track-windbreaker' ||
      kind === 'track-shell' ||
      kind === 'tee-boxy' ||
      kind === 'puffer-jacket';

    for (let y = 0; y < height; y++) {
      const wR = rowWallR[y];
      const wG = rowWallG[y];
      const wB = rowWallB[y];
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const p = idx * 4;
        if (isBg[idx] || isHalo[idx] || y < Math.round(height * 0.04)) {
          d[p + 3] = 0;
          continue;
        }

        const touchesBg =
          (x > 0 && (isBg[idx - 1] || isHalo[idx - 1])) ||
          (x < width - 1 && (isBg[idx + 1] || isHalo[idx + 1])) ||
          (y > 0 && (isBg[idx - width] || isHalo[idx - width])) ||
          (y < height - 1 && (isBg[idx + width] || isHalo[idx + width]));

        if (touchesBg) {
          d[p + 3] = 165;
          // Decontaminate edge pixels mixed with studio wall color
          d[p] = clampByte(d[p] - (wR - d[p]) * 0.18);
          d[p + 1] = clampByte(d[p + 1] - (wG - d[p + 1]) * 0.18);
          d[p + 2] = clampByte(d[p + 2] - (wB - d[p + 2]) * 0.18);
        }

        if (y <= hangerCutoffY) continue;

        let r = d[p];
        let g = d[p + 1];
        let b = d[p + 2];
        const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

        // Subtle photographic colorway shifts ONLY when user clicks secondary color swatches
        if (typeof hueShiftDeg === 'number' && hueShiftDeg !== 0) {
          const [h, s, l] = rgbToHsl(r, g, b);
          if (s > 0.18 && l > 0.08 && l < 0.9) {
            const shiftedH = (((h + hueShiftDeg / 360) % 1) + 1) % 1;
            const adjS = Math.min(0.92, Math.max(0, s * satScale));
            const adjL = Math.min(0.9, Math.max(0.06, l * lightScale));
            const [nr, ng, nb] = hslToRgb(shiftedH, adjS, adjL);
            r = nr;
            g = ng;
            b = nb;
          }
        } else if (softTintHsl) {
          const keepTrimPanel =
            (isColorblock && (lum > 0.68 || lum < 0.22)) ||
            (kind === 'jiujitsu-gi' && lum < 0.2) ||
            (kind === 'sweatsuit-set' && lum > 0.78) ||
            (kind === 'drawstring-bag' && lum < 0.22);

          if (!keepTrimPanel && lum > 0.05) {
            const [, ps, pl] = rgbToHsl(r, g, b);
            const [th, ts, tl] = softTintHsl;
            const dyedL = Math.min(0.84, Math.max(0.05, pl * (0.76 + tl * 0.66) * lightScale));
            const dyedS = Math.min(0.86, Math.max(ps * 0.65, ts * 0.85 * satScale));
            const [hr, hg, hb] = hslToRgb(th, dyedS, dyedL);
            const blend = 0.72;
            r = Math.round(r * (1 - blend) + hr * blend);
            g = Math.round(g * (1 - blend) + hg * blend);
            b = Math.round(b * (1 - blend) + hb * blend);
          }
        }

        d[p] = r;
        d[p + 1] = g;
        d[p + 2] = b;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    // Composite Thumb Sports crest INTO the real garment weave & folds (zero pasted-on drop shadow!)
    stampThumbBrandOnGarment(
      ctx,
      logoAssets.emblemCanvas,
      logoAssets.fullLogoCanvas,
      kind,
      basePhoto,
      width,
      height,
    );

    // Build soft wall drop shadow silhouette
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = Math.round(width / 2);
    shadowCanvas.height = Math.round(height / 2);
    const sCtx = shadowCanvas.getContext('2d')!;
    sCtx.filter = 'blur(16px)';
    sCtx.drawImage(canvas, 0, 0, shadowCanvas.width, shadowCanvas.height);
    sCtx.filter = 'none';
    sCtx.globalCompositeOperation = 'source-in';
    sCtx.fillStyle = 'rgba(18, 17, 15, 0.28)';
    sCtx.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height);

    return { garmentCanvas: canvas, shadowCanvas };
  })();

  cutoutCanvasCache.set(cacheKey, task);
  return task;
}

export async function createGarmentThreeCutout(
  kind: GarmentVisualKind,
  basePhoto: string,
  hookYRatio: number,
  appearance: GarmentAppearance = {},
  maxAnisotropy = 8,
): Promise<{ garmentTex: THREE.CanvasTexture; shadowTex: THREE.CanvasTexture }> {
  const { garmentCanvas, shadowCanvas } = await buildCutoutAndShadow(
    kind,
    basePhoto,
    hookYRatio,
    appearance,
    900,
    1200,
  );

  const garmentTex = new THREE.CanvasTexture(garmentCanvas);
  garmentTex.colorSpace = THREE.SRGBColorSpace;
  garmentTex.minFilter = THREE.LinearMipmapLinearFilter;
  garmentTex.magFilter = THREE.LinearFilter;
  garmentTex.anisotropy = maxAnisotropy;
  garmentTex.needsUpdate = true;

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  shadowTex.colorSpace = THREE.SRGBColorSpace;
  shadowTex.needsUpdate = true;

  return { garmentTex, shadowTex };
}

/**
 * Generates Full-HD transparent PNG preview URL (NO white background box behind garment!).
 */
export async function getGarmentPreviewDataUrl(
  kind: GarmentVisualKind,
  basePhoto: string,
  hookYRatio = 0.1,
  appearance: GarmentAppearance = {},
): Promise<string> {
  const key = `${kind}|${basePhoto}|${hookYRatio}|${appearanceKey(appearance)}`;
  const cached = previewUrlCache.get(key);
  if (cached) return cached;

  const { garmentCanvas } = await buildCutoutAndShadow(
    kind,
    basePhoto,
    hookYRatio,
    appearance,
    900,
    1200,
  );

  const out = document.createElement('canvas');
  out.width = 900;
  out.height = 1200;
  const ctx = out.getContext('2d')!;
  ctx.clearRect(0, 0, 900, 1200);
  ctx.save();
  ctx.shadowColor = 'rgba(17, 19, 23, 0.16)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 9;
  ctx.drawImage(garmentCanvas, 0, 0);
  ctx.restore();

  const url = out.toDataURL('image/png');
  previewUrlCache.set(key, url);
  return url;
}

interface ModelBrandSpot {
  x: number;
  y: number;
  size: number;
  fullLockup?: boolean;
  rotateDeg?: number;
  opacity?: number;
}

const MODEL_BRAND_PLACEMENTS: Record<string, ModelBrandSpot[]> = {
  ladies_coral_sweatsuit: [
    { x: 0.566, y: 0.258, size: 0.044 },
    { x: 0.548, y: 0.535, size: 0.039 },
  ],
  new_emerald_sweatsuit: [
    { x: 0.568, y: 0.252, size: 0.046 },
    { x: 0.552, y: 0.575, size: 0.04 },
  ],
  mens_mocha_sweatsuit: [
    { x: 0.568, y: 0.255, size: 0.046 },
    { x: 0.555, y: 0.565, size: 0.04 },
  ],
  new_lavender_sportskit: [
    { x: 0.562, y: 0.285, size: 0.036 },
    { x: 0.555, y: 0.485, size: 0.038 },
  ],
  ladies_sports_kit: [
    { x: 0.548, y: 0.256, size: 0.038 },
    { x: 0.558, y: 0.495, size: 0.038 },
  ],
  new_cobalt_spats: [
    { x: 0.558, y: 0.262, size: 0.044 },
    { x: 0.555, y: 0.555, size: 0.038 },
  ],
  mens_compression_spats: [
    { x: 0.558, y: 0.268, size: 0.042 },
    { x: 0.558, y: 0.555, size: 0.04 },
  ],
  ladies_cyan_puffer: [{ x: 0.568, y: 0.238, size: 0.044 }],
  new_teal_windbreaker: [
    { x: 0.568, y: 0.258, size: 0.044 },
    { x: 0.552, y: 0.565, size: 0.038 },
  ],
  mens_orange_puffer: [{ x: 0.568, y: 0.228, size: 0.044 }],
  mens_cyan_amber_track: [{ x: 0.568, y: 0.248, size: 0.046 }],
  mens_olive_bomber: [{ x: 0.578, y: 0.275, size: 0.044 }],
  new_crimson_varsity: [{ x: 0.574, y: 0.268, size: 0.048 }],
  ladies_chalk_windbreaker: [{ x: 0.564, y: 0.256, size: 0.043 }],
  mens_drawstring_bag: [{ x: 0.415, y: 0.345, size: 0.135, fullLockup: true, rotateDeg: -6, opacity: 0.94 }],
  new_cobalt_jiujitsu: [
    { x: 0.585, y: 0.288, size: 0.046 },
    { x: 0.552, y: 0.595, size: 0.04 },
  ],
  mens_jiujitsu_gi: [
    { x: 0.585, y: 0.285, size: 0.046 },
    { x: 0.555, y: 0.595, size: 0.04 },
  ],
  mens_umber_crewneck: [{ x: 0.568, y: 0.268, size: 0.046 }],
  ladies_burgundy_hoodie: [{ x: 0.568, y: 0.262, size: 0.045 }],
  mens_charcoal_hoodie: [{ x: 0.568, y: 0.265, size: 0.046 }],
  mens_cobalt_jersey: [
    { x: 0.568, y: 0.255, size: 0.044 },
    { x: 0.502, y: 0.345, size: 0.13, fullLockup: true, opacity: 0.9 },
  ],
  ladies_bone_tee: [{ x: 0.562, y: 0.268, size: 0.044 }],
  mens_black_cargo: [
    { x: 0.608, y: 0.592, size: 0.042 },
    { x: 0.565, y: 0.255, size: 0.042 },
  ],
};

function findModelBrandSpots(photoUrl: string): ModelBrandSpot[] {
  for (const [key, spots] of Object.entries(MODEL_BRAND_PLACEMENTS)) {
    if (photoUrl.includes(key)) {
      return spots;
    }
  }
  return [{ x: 0.566, y: 0.26, size: 0.044 }];
}

const brandedModelCanvasCache = new Map<string, Promise<HTMLCanvasElement>>();
const brandedModelUrlMemoryCache = new Map<string, string>();
const brandedModelUrlPromiseCache = new Map<string, Promise<string>>();
const modelTexCache = new Map<string, Promise<THREE.CanvasTexture>>();

async function buildBrandedModelCanvas(photoUrl: string): Promise<HTMLCanvasElement> {
  const existing = brandedModelCanvasCache.get(photoUrl);
  if (existing) return existing;

  const task = (async () => {
    const [img, logoAssets] = await Promise.all([
      loadHtmlImage(photoUrl),
      getThumbLogoAssets(),
    ]);

    const width = 900;
    const height = 1200;
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Smoothly lift neutral studio backdrop highlights to mathematical #ffffff white with zero box seam
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let y = 0; y < height; y++) {
      const ny = y / height;
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const p = (y * width + x) * 4;
        const r = d[p];
        const g = d[p + 1];
        const b = d[p + 2];
        const lum = r * 0.299 + g * 0.587 + b * 0.114;
        const sat = Math.max(r, g, b) - Math.min(r, g, b);

        // Strong cleanup on outer studio surround, gentle highlight snap near pure white studio wall
        const inOuterMargin = nx < 0.22 || nx > 0.78 || ny < 0.06 || ny > 0.96;
        if ((inOuterMargin && lum > 232 && sat < 14) || (lum > 246 && sat < 8)) {
          d[p] = 255;
          d[p + 1] = 255;
          d[p + 2] = 255;
        }
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Integrate Thumb Sports Industries emblem directly into fabric folds & weave on the model
    const spots = findModelBrandSpots(photoUrl);
    for (const spot of spots) {
      const logoCanvas = spot.fullLockup ? logoAssets.fullLogoCanvas : logoAssets.emblemCanvas;
      compositeLogoIntoFabric(
        ctx,
        logoCanvas,
        width,
        height,
        width * spot.x,
        height * spot.y,
        width * spot.size,
        spot.opacity ?? 0.94,
        1.5,
        0.38,
        spot.rotateDeg ?? 0,
      );
    }

    return canvas;
  })();

  brandedModelCanvasCache.set(photoUrl, task);
  return task;
}

export function getCachedBrandedModelDataUrl(photoUrl: string): string | undefined {
  return brandedModelUrlMemoryCache.get(photoUrl);
}

export async function getBrandedModelDataUrl(photoUrl: string): Promise<string> {
  const mem = brandedModelUrlMemoryCache.get(photoUrl);
  if (mem) return mem;

  const existing = brandedModelUrlPromiseCache.get(photoUrl);
  if (existing) return existing;

  const task = (async () => {
    const canvas = await buildBrandedModelCanvas(photoUrl);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.93);
    brandedModelUrlMemoryCache.set(photoUrl, dataUrl);
    return dataUrl;
  })();

  brandedModelUrlPromiseCache.set(photoUrl, task);
  return task;
}

export async function createModelWhiteThreeTexture(
  photoUrl: string,
  maxAnisotropy = 4,
): Promise<THREE.CanvasTexture> {
  const existing = modelTexCache.get(photoUrl);
  if (existing) return existing;

  const task = (async () => {
    const canvas = await buildBrandedModelCanvas(photoUrl);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = maxAnisotropy;
    tex.needsUpdate = true;
    return tex;
  })();

  modelTexCache.set(photoUrl, task);
  return task;
}

export function createWallPlasterTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Faint vertical architectural studio panel seam for subtle parallax depth
  ctx.strokeStyle = 'rgba(17, 19, 23, 0.025)';
  ctx.lineWidth = 1.5;
  for (let x = 0; x < 512; x += 256) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createFloorConcreteTexture(maxAnisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f5f6f8';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 4;
    d[i] = Math.min(255, Math.max(0, d[i] + n));
    d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
    d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createPlacardTexture(
  title: string,
  subtitle: string,
  meta: string,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 560;
  canvas.height = 148;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 560, 148);

  ctx.fillStyle = '#C6922D';
  ctx.fillRect(4, 2, 42, 4);
  ctx.fillStyle = '#111317';
  ctx.fillRect(50, 2, 22, 4);

  ctx.fillStyle = '#111317';
  ctx.font = '700 28px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(title, 4, 14, 550);

  ctx.fillStyle = '#52504a';
  ctx.font = '400 21px "Plus Jakarta Sans", -apple-system, sans-serif';
  ctx.fillText(subtitle, 4, 54, 550);

  ctx.fillStyle = '#9E7018';
  ctx.font = '500 17px "JetBrains Mono", monospace';
  ctx.fillText(meta, 4, 94, 550);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function createMacroWeaveDataUrl(gsmLabel: string, colorHex: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  const rgb = hexToRgb(colorHex);
  ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  ctx.fillRect(0, 0, 600, 800);

  for (let y = 0; y < 800; y += 6) {
    for (let x = 0; x < 600; x += 6) {
      const shade = ((x + y) % 12 === 0 ? 18 : -14) + (Math.random() - 0.5) * 16;
      ctx.fillStyle = `rgba(${shade > 0 ? 255 : 0}, ${shade > 0 ? 255 : 0}, ${shade > 0 ? 255 : 0}, ${Math.abs(shade) / 255})`;
      ctx.fillRect(x, y, 4, 4);
    }
  }

  ctx.fillStyle = 'rgba(17, 18, 20, 0.86)';
  ctx.fillRect(28, 676, 544, 96);
  ctx.fillStyle = '#f8f7f4';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('THUMB SPORTS TEXTILE LAB', 50, 712);
  ctx.fillStyle = '#FCD34D';
  ctx.font = '500 18px "JetBrains Mono", monospace';
  ctx.fillText(`DENSITY: ${gsmLabel.toUpperCase()} · MILLED SPEC`, 50, 746);

  return canvas.toDataURL('image/jpeg', 0.92);
}

export function createSpecBlueprintDataUrl(product: ProductSpec): string {
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 800;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f7f6f2';
  ctx.fillRect(0, 0, 600, 800);

  ctx.strokeStyle = 'rgba(217, 119, 6, 0.1)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= 600; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 800);
    ctx.stroke();
  }
  for (let y = 0; y <= 800; y += 30) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(600, y);
    ctx.stroke();
  }

  ctx.strokeStyle = '#111214';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, 544, 744);

  ctx.fillStyle = '#111214';
  ctx.font = '700 20px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`THUMB SPORTS INDUSTRIES · ${product.sku}`, 52, 74);
  ctx.fillStyle = '#B45309';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  ctx.fillText(product.name.toUpperCase(), 52, 104, 496);

  ctx.strokeStyle = '#111214';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(235, 175);
  ctx.lineTo(365, 175);
  ctx.lineTo(445, 215);
  ctx.lineTo(505, 390);
  ctx.lineTo(445, 415);
  ctx.lineTo(410, 290);
  ctx.lineTo(410, 520);
  ctx.lineTo(190, 520);
  ctx.lineTo(190, 290);
  ctx.lineTo(155, 415);
  ctx.lineTo(95, 390);
  ctx.lineTo(155, 215);
  ctx.closePath();
  ctx.stroke();

  ctx.strokeStyle = '#E11D48';
  ctx.setLineDash([6, 4]);
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(190, 325);
  ctx.lineTo(410, 325);
  ctx.moveTo(300, 175);
  ctx.lineTo(300, 520);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#E11D48';
  ctx.font = '500 15px "JetBrains Mono", monospace';
  const midRow = product.measurements[Math.floor(product.measurements.length / 2)];
  ctx.fillText(`CHEST / WAIST: ${midRow?.chest ?? '65 cm'}`, 210, 315);
  ctx.fillText(`LEN: ${midRow?.length ?? '72 cm'}`, 310, 440);

  ctx.fillStyle = '#111214';
  ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('CONSTRUCTION & TOLERANCE (±1.0 CM)', 52, 590);
  ctx.fillStyle = '#52504b';
  ctx.font = '400 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Fabric: ${product.composition}`, 52, 625, 496);
  ctx.fillText(`Seam: ${product.stitchingSpec}`, 52, 655, 496);
  ctx.fillText(`MOQ: ${product.moq} pcs · Lead Time: ${product.leadTimeDays}`, 52, 685, 496);

  return canvas.toDataURL('image/jpeg', 0.92);
}
