// Optimize images in place under public/images.
// - JPG/JPEG: re-encode with mozjpeg at quality 78, max width 1800px
// - PNG that are screenshots/photos: convert behavior kept simple (re-compress)
// - Skips files <= 120 KB (already small)
// - Skips logos / SVGs

import { readdir, stat, rename } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname, extname, basename, resolve } from 'node:path';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = resolve(__dirname, '..', 'public', 'images');

const SKIP_BASENAMES = new Set([
  'jamail hardwoods logo.png',
  'jamail-logo-hardwoods-transparent-logo.webp',
  'JH LOGO Updated.png',
  'Google_Favicon_2025.svg',
  'Houzz logo.png',
  'Yelp_Logo.svg.png',
  'google review.png',
  'google-reviews.webp'
]);

const MAX_WIDTH = 1800;
const JPEG_Q = 78;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

function fmtBytes(n) {
  if (n > 1024 * 1024) return (n / 1024 / 1024).toFixed(2) + ' MB';
  if (n > 1024) return (n / 1024).toFixed(1) + ' KB';
  return n + ' B';
}

let totalBefore = 0;
let totalAfter = 0;
let processed = 0;
let skipped = 0;

for await (const file of walk(ROOT)) {
  const ext = extname(file).toLowerCase();
  const base = basename(file);
  if (SKIP_BASENAMES.has(base)) { skipped++; continue; }
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) { skipped++; continue; }

  const st = await stat(file);
  if (st.size <= 120 * 1024) { skipped++; continue; }

  totalBefore += st.size;
  const tmp = file + '.opt-tmp';

  try {
    const img = sharp(file, { failOn: 'none' }).rotate();
    const meta = await img.metadata();
    const pipeline = (meta.width && meta.width > MAX_WIDTH)
      ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true })
      : img;

    if (ext === '.png') {
      // Re-encode photo-like PNGs as JPEG for huge wins, but keep extension if alpha present
      if (meta.hasAlpha) {
        await pipeline.png({ compressionLevel: 9, palette: true, quality: 80 }).toFile(tmp);
      } else {
        // Save next to original as .jpg replacement (same name, .jpg extension)
        await pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true }).toFile(tmp);
      }
    } else {
      await pipeline.jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true }).toFile(tmp);
    }

    const ns = await stat(tmp);
    if (ns.size < st.size * 0.95) {
      await rename(tmp, file);
      totalAfter += ns.size;
      processed++;
      const rel = file.slice(ROOT.length + 1);
      console.log(`  ${fmtBytes(st.size)} → ${fmtBytes(ns.size)}  ${rel}`);
    } else {
      totalAfter += st.size;
      skipped++;
      // remove temp
      const { rm } = await import('node:fs/promises');
      await rm(tmp).catch(() => {});
    }
  } catch (err) {
    console.warn('Skip (error):', file, err.message);
    skipped++;
    const { rm } = await import('node:fs/promises');
    if (existsSync(tmp)) await rm(tmp).catch(() => {});
  }
}

console.log('\n===== IMAGE OPTIMIZATION REPORT =====');
console.log(`Processed:  ${processed}`);
console.log(`Skipped:    ${skipped}`);
console.log(`Before:     ${fmtBytes(totalBefore)}`);
console.log(`After:      ${fmtBytes(totalAfter)}`);
const savedBytes = totalBefore - totalAfter;
console.log(`Saved:      ${fmtBytes(savedBytes)} (${totalBefore ? ((savedBytes / totalBefore) * 100).toFixed(1) : 0}%)`);
