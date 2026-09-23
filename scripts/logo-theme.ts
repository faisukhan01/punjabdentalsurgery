/**
 * Extract official logo colors + produce transparent trimmed logo assets.
 * - Samples dominant deep-blue and teal hues from the uploaded logo
 * - Un-blends white background to transparency (preserves anti-aliasing)
 * - Writes /public/logo.png (trimmed, width 960) and /src/app/icon.png (512)
 */
import sharp from "sharp";

const SRC = "/home/z/my-project/upload/pasted_image_1790149406083.png";

function rgbToHue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return -1;
  const d = max - min;
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  h *= 60;
  return h < 0 ? h + 360 : h;
}

const img = sharp(SRC);
const meta = await img.metadata();
const { data, info } = await img
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const W = info.width, H = info.height, CH = info.channels;

// ---- 1. Color sampling: most frequent saturated colors per hue family ----
const blueCount = new Map<string, number>();
const tealCount = new Map<string, number>();
for (let i = 0; i < W * H; i++) {
  const r = data[i * CH], g = data[i * CH + 1], b = data[i * CH + 2];
  const a = data[i * CH + 3];
  if (a < 200) continue;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max > 245 && min > 245) continue; // white bg
  const sat = (max - min) / max;
  if (sat < 0.2) continue;
  const hue = rgbToHue(r, g, b);
  const key = `${r >> 3 << 3},${g >> 3 << 3},${b >> 3 << 3}`; // bucket to /8
  if (hue >= 195 && hue <= 235) blueCount.set(key, (blueCount.get(key) ?? 0) + 1);
  else if (hue >= 160 && hue < 195) tealCount.set(key, (tealCount.get(key) ?? 0) + 1);
}
const top = (m: Map<string, number>) =>
  [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log("BLUES:", top(blueCount));
console.log("TEALS:", top(tealCount));

// ---- 2. White -> transparent (un-blend from white) + bbox ----
let minX = W, minY = H, maxX = 0, maxY = 0;
const out = Buffer.alloc(W * H * 4);
for (let i = 0; i < W * H; i++) {
  const r = data[i * CH], g = data[i * CH + 1], b = data[i * CH + 2];
  const min = Math.min(r, g, b);
  const a = 255 - min; // white -> 0, saturated -> high
  const o = i * 4;
  if (a <= 8) {
    out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0;
    continue;
  }
  // un-blend: observed = c*a + 255*(1-a)  =>  c = (observed - 255*(1-a)) / a
  const af = a / 255;
  out[o] = Math.min(255, Math.max(0, Math.round((r - 255 * (1 - af)) / af)));
  out[o + 1] = Math.min(255, Math.max(0, Math.round((g - 255 * (1 - af)) / af)));
  out[o + 2] = Math.min(255, Math.max(0, Math.round((b - 255 * (1 - af)) / af)));
  out[o + 3] = a;
  const x = i % W, y = (i / W) | 0;
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}
const pad = 6;
minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
maxX = Math.min(W - 1, maxX + pad); maxY = Math.min(H - 1, maxY + pad);
const cw = maxX - minX + 1, chh = maxY - minY + 1;
console.log("bbox:", { minX, minY, cw, chh });

const trimmed = sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: cw, height: chh });

// Main logo: width 960, keep ratio
const mainBuf = await trimmed.clone().resize({ width: 960 }).png().toBuffer();
await sharp(mainBuf).toFile("/home/z/my-project/public/logo.png");

// Icon: 512x512 canvas, logo scaled to fit with small margin
const side = Math.round(Math.max(cw, chh) * 1.06);
const iconBuf = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .extract({ left: minX, top: minY, width: cw, height: chh })
  .resize({ width: side, height: side, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp(iconBuf).resize(512, 512).png().toFile("/home/z/my-project/src/app/icon.png");

const stat = await sharp("/home/z/my-project/public/logo.png").metadata();
console.log("logo.png:", stat.width, "x", stat.height);
console.log("DONE");
