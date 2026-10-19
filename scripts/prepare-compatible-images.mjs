import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';

// Include optional portrait/footage overrides as well as the built-in artwork.
async function prepare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await prepare(path);
    else if (/\.webp$/i.test(entry.name)) {
      await sharp(path).flatten({ background: '#e7e0d0' }).jpeg({ quality: 85 }).toFile(path.replace(/\.webp$/i, '.jpg'));
      await sharp(path).resize({ width: 400, withoutEnlargement: true }).flatten({ background: '#e7e0d0' }).jpeg({ quality: 80 }).toFile(path.replace(/\.webp$/i, '.thumb.jpg'));
    }
  }
}

await prepare('public/cases');
console.log('Prepared JPEG artwork and small thumbnails for all case WebP images.');
