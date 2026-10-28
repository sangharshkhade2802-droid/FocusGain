// Generates 1x1 or minimal solid PNG icons for Chrome extension
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Minimal valid 16x16 / 48x48 / 128x128 PNG buffer generator (or 1x1 PNG repeated)
// A valid 1x1 transparent/colored PNG
const png1x1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

fs.writeFileSync(path.join(iconsDir, 'icon16.png'), png1x1);
fs.writeFileSync(path.join(iconsDir, 'icon48.png'), png1x1);
fs.writeFileSync(path.join(iconsDir, 'icon128.png'), png1x1);

console.log('Extension icons created successfully.');
