import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a clean, professional logo at multiple sizes
async function generateLogos() {
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 },
    { name: 'apple-touch-icon.png', size: 180 },
  ];

  // SVG logo - clean "BS" monogram with gradient background
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="108" fill="url(#bg)"/>
  <text x="256" y="295" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="260" fill="white" dominant-baseline="middle" letter-spacing="-10">BS</text>
</svg>`;

  const svgBuffer = Buffer.from(svg);

  for (const { name, size } of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();

    const outPath = resolve(__dirname, 'public', name);
    writeFileSync(outPath, pngBuffer);
    console.log(`Generated ${name} (${size}x${size})`);
  }

  // Also generate the OG image as PNG (1200x630)
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a14"/>
      <stop offset="50%" style="stop-color:#0f0f1e"/>
      <stop offset="100%" style="stop-color:#0a0a14"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
    <linearGradient id="icon-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1"/>
      <stop offset="100%" style="stop-color:#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <g opacity="0.03">
    <line x1="0" y1="0" x2="1200" y2="630" stroke="white" stroke-width="1"/>
    <line x1="400" y1="0" x2="1200" y2="420" stroke="white" stroke-width="1"/>
    <line x1="800" y1="0" x2="1200" y2="210" stroke="white" stroke-width="1"/>
    <line x1="0" y1="210" x2="800" y2="630" stroke="white" stroke-width="1"/>
    <line x1="0" y1="420" x2="400" y2="630" stroke="white" stroke-width="1"/>
  </g>
  <ellipse cx="600" cy="260" rx="300" ry="150" fill="#6366f1" opacity="0.06"/>
  <rect x="534" y="120" width="132" height="132" rx="32" fill="url(#icon-bg)"/>
  <text x="600" y="200" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="72" fill="white" dominant-baseline="middle">BS</text>
  <text x="600" y="340" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="800" font-size="56" fill="white">Ban Sagar</text>
  <text x="600" y="400" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="500" font-size="24" fill="rgba(255,255,255,0.5)">Myanmar's Community-Driven Slang Dictionary</text>
  <rect x="480" y="440" width="240" height="3" rx="1.5" fill="url(#accent)" opacity="0.6"/>
  <text x="600" y="490" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="600" font-size="20" fill="rgba(255,255,255,0.3)">bansagar.madebysai.com</text>
</svg>`;

  const ogPng = await sharp(Buffer.from(ogSvg))
    .resize(1200, 630)
    .png()
    .toBuffer();

  writeFileSync(resolve(__dirname, 'public', 'og-image.png'), ogPng);
  console.log('Generated og-image.png (1200x630)');

  console.log('\nDone! Upload favicon-512x512.png to Google OAuth consent screen as your app logo.');
}

generateLogos().catch(console.error);
