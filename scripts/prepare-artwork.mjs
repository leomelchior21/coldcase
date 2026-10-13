import { readFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';
const { assets } = JSON.parse(readFileSync('artwork/prompts.json', 'utf8'));
mkdirSync('artwork/source', { recursive: true });
for (const asset of assets) {
  const source = `artwork/source/${asset.name}.png`;
  if (!existsSync(source)) copyFileSync(asset.source, source);
  if (existsSync(asset.output)) continue;
  mkdirSync(dirname(asset.output), { recursive: true });
  const width = asset.kind === 'portrait' ? 560 : 1200;
  await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toFile(asset.output);
  console.log(asset.output);
}
