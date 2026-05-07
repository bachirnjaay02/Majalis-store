import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp('./majalis-store-blanc.png')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 26, g: 18, b: 7, alpha: 1 }
    })
    .flatten({ background: { r: 26, g: 18, b: 7 } })
    .toFile(`./public/icons/icon-${size}x${size}.png`);
  console.log(`icon-${size}x${size}.png OK`);
}