/**
 * Simple script to generate extension icons
 * Run with: node generate-icons.js
 * 
 * Creates simple colored square icons in the icons/ directory
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createPNG(size) {
  // Colors
  const bgR = 0x18, bgG = 0x18, bgB = 0x1B; // Dark zinc
  const fgR = 0xFA, fgG = 0xFA, fgB = 0xFA; // Light text
  
  // Create raw image data
  const rawData = [];
  
  // Simple "K" pattern scaled to size
  const letterScale = size / 16;
  const padding = Math.floor(size * 0.25);
  
  for (let y = 0; y < size; y++) {
    rawData.push(0); // Filter byte (none)
    for (let x = 0; x < size; x++) {
      // Check if pixel is part of the "K" letter
      const nx = (x - padding) / letterScale;
      const ny = (y - padding) / letterScale;
      
      // Simple K shape: left vertical bar + two diagonals
      const inLeftBar = nx >= 0 && nx < 2;
      const inTopDiag = ny >= 0 && ny < 6 && Math.abs(nx - 2 - (5 - ny)) < 1.5;
      const inBotDiag = ny >= 5 && ny < 11 && Math.abs(nx - 2 - (ny - 5)) < 1.5;
      const inK = (inLeftBar && ny >= 0 && ny < 11) || inTopDiag || inBotDiag;
      
      if (x >= padding && x < size - padding && y >= padding && y < size - padding && inK) {
        rawData.push(fgR, fgG, fgB);
      } else {
        rawData.push(bgR, bgG, bgB);
      }
    }
  }
  
  // Compress with deflate
  const compressed = zlib.deflateSync(Buffer.from(rawData), { level: 9 });
  
  // Build PNG file
  const chunks = [];
  
  // PNG signature
  chunks.push(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // Width
  ihdrData.writeUInt32BE(size, 4);  // Height
  ihdrData.writeUInt8(8, 8);        // Bit depth
  ihdrData.writeUInt8(2, 9);        // Color type (RGB)
  ihdrData.writeUInt8(0, 10);       // Compression
  ihdrData.writeUInt8(0, 11);       // Filter
  ihdrData.writeUInt8(0, 12);       // Interlace
  
  const ihdrType = Buffer.from('IHDR');
  const ihdrCrc = crc32(Buffer.concat([ihdrType, ihdrData]));
  
  const ihdrChunk = Buffer.alloc(12 + 13);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrType.copy(ihdrChunk, 4);
  ihdrData.copy(ihdrChunk, 8);
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);
  chunks.push(ihdrChunk);
  
  // IDAT chunk
  const idatType = Buffer.from('IDAT');
  const idatCrc = crc32(Buffer.concat([idatType, compressed]));
  
  const idatChunk = Buffer.alloc(12 + compressed.length);
  idatChunk.writeUInt32BE(compressed.length, 0);
  idatType.copy(idatChunk, 4);
  compressed.copy(idatChunk, 8);
  idatChunk.writeUInt32BE(idatCrc, 8 + compressed.length);
  chunks.push(idatChunk);
  
  // IEND chunk
  const iendType = Buffer.from('IEND');
  const iendCrc = crc32(iendType);
  
  const iendChunk = Buffer.alloc(12);
  iendChunk.writeUInt32BE(0, 0);
  iendType.copy(iendChunk, 4);
  iendChunk.writeUInt32BE(iendCrc, 8);
  chunks.push(iendChunk);
  
  return Buffer.concat(chunks);
}

// Generate icons
const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

sizes.forEach(size => {
  const png = createPNG(size);
  const filename = path.join(iconsDir, `icon${size}.png`);
  fs.writeFileSync(filename, png);
  console.log(`Created ${filename} (${png.length} bytes)`);
});

console.log('\nIcons generated successfully!');
console.log('You can now load the extension in Chrome:');
console.log('1. Go to chrome://extensions');
console.log('2. Enable "Developer mode"');
console.log('3. Click "Load unpacked"');
console.log('4. Select the chrome-extension folder');
