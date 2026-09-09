import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('./public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const source = sharp('./majalis.png');
const croppedLogo = await source.extract({ left: 240, top: 480, width: 740, height: 430 }).toBuffer();

for (const size of sizes) {
  await sharp(croppedLogo)
    .trim({
      background: { r: 255, g: 255, b: 255, alpha: 1 },
      threshold: 12,
    })
    .resize(size, size, {
      fit: 'contain',
      background: { r: 26, g: 18, b: 7, alpha: 1 }
    })
    .flatten({ background: { r: 26, g: 18, b: 7 } })
    .toFile(`./public/icons/icon-${size}x${size}.png`);
  console.log(`icon-${size}x${size}.png OK`);
}