import sharp from 'sharp';
import fs from 'fs';

async function processImage() {
  const input = 'public/logoYiYi.png';
  const output = 'public/favicon-rounded.png';

  // Get image dimensions
  const metadata = await sharp(input).metadata();
  const size = Math.min(metadata.width, metadata.height);
  
  // Calculate zoom box (60% of original size to zoom in more)
  const zoomSize = Math.floor(size * 0.6);
  const left = Math.floor((metadata.width - zoomSize) / 2);
  const top = Math.floor((metadata.height - zoomSize) / 2);

  const finalSize = 128;

  // Create circular mask with finalSize
  const circleSvg = `<svg width="${finalSize}" height="${finalSize}">
    <circle cx="${finalSize / 2}" cy="${finalSize / 2}" r="${finalSize / 2}" />
  </svg>`;

  await sharp(input)
    .extract({ left, top, width: zoomSize, height: zoomSize })
    .resize(finalSize, finalSize) // Final favicon size
    .composite([{
      input: Buffer.from(circleSvg),
      blend: 'dest-in'
    }])
    .png()
    .toFile(output);
    
  console.log('Favicon generated successfully at', output);
}

processImage().catch(console.error);
