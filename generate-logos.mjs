import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOURCE = resolve(__dirname, 'public', 'new-logo.png');

async function generateAll() {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  for (const { name, size } of sizes) {
    const buf = await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .png({ quality: 90 })
      .toBuffer();

    writeFileSync(resolve(__dirname, 'public', name), buf);
    console.log(`  ${name} (${size}x${size}) - ${(buf.length / 1024).toFixed(1)} KB`);
  }

  // OG image: logo centered on dark background (1200x630)
  const logoResized = await sharp(SOURCE)
    .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const ogImage = await sharp({
    create: {
      width: 1200,
      height: 630,
      channels: 4,
      background: { r: 10, g: 10, b: 20, alpha: 255 },
    },
  })
    .composite([
      {
        input: logoResized,
        top: 60,
        left: Math.round((1200 - 280) / 2),
      },
      {
        input: Buffer.from(
          `<svg width="1200" height="630">
            <text x="600" y="420" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="48" fill="white">Ban Sagar</text>
            <text x="600" y="470" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="500" font-size="22" fill="rgba(255,255,255,0.45)">Myanmar's Community-Driven Slang Dictionary</text>
            <rect x="480" y="500" width="240" height="3" rx="1.5" fill="rgba(99,102,241,0.5)"/>
            <text x="600" y="550" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="18" fill="rgba(255,255,255,0.25)">bansagar.madebysai.com</text>
          </svg>`
        ),
        top: 0,
        left: 0,
      },
    ])
    .png({ quality: 90 })
    .toBuffer();

  writeFileSync(resolve(__dirname, 'public', 'og-image.png'), ogImage);
  console.log(`  og-image.png (1200x630) - ${(ogImage.length / 1024).toFixed(1)} KB`);

  console.log('\nDone!');
}

generateAll().catch(console.error);
