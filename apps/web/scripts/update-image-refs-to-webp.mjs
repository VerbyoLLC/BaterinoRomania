/**
 * Updates source references from JPG/JPEG/PNG to WebP for converted public images.
 */
import { readdir, readFile, writeFile, stat } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const publicDir = path.resolve(__dirname, '../public');

const RASTER = /\.(jpe?g|png)$/i;
const SOURCE_EXT = /\.(tsx?|jsx?|html|css|json)$/i;

async function walk(dir, filter) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      files.push(...(await walk(full, filter)));
    } else if (filter(full)) {
      files.push(full);
    }
  }
  return files;
}

async function collectWebpMappings() {
  const rasterFiles = await walk(publicDir, (f) => RASTER.test(f));
  const mappings = [];

  for (const file of rasterFiles) {
    const relFromPublic = path.relative(publicDir, file).replace(/\\/g, '/');
    const relWebp = relFromPublic.replace(RASTER, '.webp');
    const webpPath = path.join(publicDir, relWebp);
    try {
      await stat(webpPath);
    } catch {
      continue;
    }

    const publicPath = `/images/${relFromPublic.replace(/^images\//, '')}`;
    const webpPublicPath = `/images/${relWebp.replace(/^images\//, '')}`;
    const encodedFrom = publicPath.replace(/ /g, '%20');
    const encodedWebp = webpPublicPath.replace(/ /g, '%20');

    for (const ext of ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']) {
      const fromRel = publicPath.replace(/\.(jpe?g|png)$/i, ext);
      const toRel = webpPublicPath;
      mappings.push([fromRel, toRel]);
      mappings.push([`https://baterino.ro${fromRel}`, `https://baterino.ro${toRel}`]);
      if (encodedFrom !== publicPath) {
        const fromEnc = encodedFrom.replace(/\.(jpe?g|png)$/i, ext);
        mappings.push([fromEnc, encodedWebp]);
        mappings.push([`https://baterino.ro${fromEnc}`, `https://baterino.ro${encodedWebp}`]);
      }
    }
  }

  return [...new Map(mappings.map(([from, to]) => [from, to])).entries()].sort(
    (a, b) => b[0].length - a[0].length,
  );
}

function applyMappings(content, mappings) {
  let next = content;
  for (const [from, to] of mappings) {
    if (next.includes(from)) {
      next = next.split(from).join(to);
    }
  }
  return next;
}

const mappings = await collectWebpMappings();
const scanRoots = [
  path.join(repoRoot, 'apps/web'),
  path.join(repoRoot, 'apps/api'),
];

let updatedFiles = 0;
let totalReplacements = 0;

for (const root of scanRoots) {
  const sourceFiles = await walk(root, (f) => SOURCE_EXT.test(f) && !f.includes('/scripts/convert-public') && !f.includes('/scripts/update-image'));

  for (const file of sourceFiles) {
    const original = await readFile(file, 'utf8');
    const next = applyMappings(original, mappings);
    if (next !== original) {
      await writeFile(file, next, 'utf8');
      updatedFiles += 1;
    }
  }
}

console.log(`Updated ${updatedFiles} source files using ${mappings.length} path mappings.`);
