import { mkdir, readdir, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import sharp from 'sharp';

const embedded = {};
// Include optional portrait/footage overrides as well as the built-in artwork.
async function prepare(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await prepare(path);
    else if (/\.webp$/i.test(entry.name)) {
      await sharp(path).flatten({ background: '#e7e0d0' }).jpeg({ quality: 85 }).toFile(path.replace(/\.webp$/i, '.jpg'));
      await sharp(path).resize({ width: 400, withoutEnlargement: true }).flatten({ background: '#e7e0d0' }).jpeg({ quality: 80 }).toFile(path.replace(/\.webp$/i, '.thumb.jpg'));
      // Travel with the application, so a failed photo download still has a real image.
      const compact = await sharp(path).resize({ width: 640, withoutEnlargement: true }).flatten({ background: '#e7e0d0' }).jpeg({ quality: 65 }).toBuffer();
      embedded['/' + relative('public', path).split(sep).join('/')] = `data:image/jpeg;base64,${compact.toString('base64')}`;
    }
  }
}

await prepare('public/cases');
await mkdir('src/generated', { recursive: true });
await writeFile('src/generated/case-images.json', JSON.stringify(embedded, null, 2) + '\n');
console.log(`Prepared JPEG artwork, thumbnails and ${Object.keys(embedded).length} bundled photo fallbacks.`);
