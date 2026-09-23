import sharp from "sharp";

/**
 * Samples the dominant crimson from the logo's red circle (ignoring the
 * white tooth and transparent corners) and prints hex + oklch candidates.
 */
async function main() {
  const src = "public/logo.png";
  const img = sharp(src);
  const { width, height } = await img.metadata();
  const raw = await img.ensureAlpha().raw().toBuffer();
  const px = width * height;

  const reds: { r: number; g: number; b: number }[] = [];
  for (let i = 0; i < px; i++) {
    const a = raw[i * 4 + 3];
    if (a < 220) continue;
    const r = raw[i * 4];
    const g = raw[i * 4 + 1];
    const b = raw[i * 4 + 2];
    // red-dominant pixels only (the circle), skip the ivory tooth
    if (r > 90 && r > g * 1.9 && r > b * 1.9) reds.push({ r, g, b });
  }

  reds.sort((a, b) => b.r + b.g + b.b - (a.r + a.g + a.b));
  const pick = (label: string, slice: { r: number; g: number; b: number }[]) => {
    if (!slice.length) return;
    const r = Math.round(slice.reduce((s, p) => s + p.r, 0) / slice.length);
    const g = Math.round(slice.reduce((s, p) => s + p.g, 0) / slice.length);
    const b = Math.round(slice.reduce((s, p) => s + p.b, 0) / slice.length);
    const hex = `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    console.log(`${label}: ${hex}  (rgb ${r},${g},${b})  n=${slice.length}`);
  };

  console.log(`total red pixels: ${reds.length}`);
  pick("median-ish (50%)", reds.slice(Math.floor(reds.length * 0.25), Math.floor(reds.length * 0.75)));
  pick("vivid top 25%", reds.slice(0, Math.floor(reds.length * 0.25)));
  pick("vivid top 10%", reds.slice(0, Math.floor(reds.length * 0.1)));
  pick("all mean", reds);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
