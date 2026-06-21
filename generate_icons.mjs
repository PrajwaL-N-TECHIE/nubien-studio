import sharp from 'sharp';
import fs from 'fs';

async function generate() {
  const svgBuffer = fs.readFileSync('public/favicon.svg');
  
  // apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile('public/apple-touch-icon.png');
    
  // logo.png (512x512) for JSON-LD and generic icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile('public/logo.png');
    
  // standard favicon.ico fallback (Google often likes a 32x32 png saved as .ico if no native library available, 
  // but let's just make a favicon.png 32x32 for safety)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile('public/favicon.png');

  console.log('Icons generated successfully!');
}

generate().catch(console.error);
