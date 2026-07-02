/**
 * Converts JPG/JPEG/PNG files under public/ to WebP.
 * Usage: node scripts/convert-public-images-to-webp.mjs [--delete]
 */
import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../public');
const deleteOriginals = process.argv.includes('--delete');

const RASTER = /\.(jpe?g|png)$/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else if (RASTER.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

async function convertFile(inputPath) {
  const outPath = inputPath.replace(RASTER, '.webp');
  const inputStat = await stat(inputPath);
  try {
    const outStat = await stat(outPath);
    if (outStat.mtimeMs >= inputStat.mtimeMs) {
      return { inputPath, outPath, skipped: true };
    }
  } catch {
    // output missing — convert
  }

  await sharp(inputPath)
    .webp({ quality: 82, effort: 4, alphaQuality: 90 })
    .toFile(outPath);

  if (deleteOriginals) {
    await unlink(inputPath);
  }

  return { inputPath, outPath, skipped: false };
}

const files = await walk(publicDir);
let converted = 0;
let skipped = 0;

for (const file of files) {
  const result = await convertFile(file);
  if (result.skipped) skipped += 1;
  else converted += 1;
}

console.log(`WebP conversion done: ${converted} converted, ${skipped} skipped, ${files.length} total raster files.`);
