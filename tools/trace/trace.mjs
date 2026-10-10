// Spec 02 trace: greyscale -> threshold -> 2x PNG -> potrace.
import sharp from 'sharp';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const Potrace = require('potrace');

const THRESHOLD = Number(process.argv[2] || 50);
const TURD = Number(process.argv[3] || 4);

const input = '../../brand/rifano-logo.PNG';
const outPng = './trace-input.png';

await sharp(input)
  .resize(1154, 866, { kernel: 'lanczos3' })
  .greyscale()
  .threshold(THRESHOLD)
  .removeAlpha()
  .negate() // metal -> black (potrace foreground), background -> white
  .png()
  .toFile(outPng);

const svg = await new Promise((resolve, reject) => {
  Potrace.trace(
    'trace-input.png',
    { threshold: 128, turdSize: TURD, optTolerance: 0.3, optCurve: true },
    (err, s) => (err ? reject(err) : resolve(s)),
  );
});
console.log(JSON.stringify({ threshold: THRESHOLD, turdSize: TURD, bytes: svg.length }));
const fs = await import('fs');
fs.writeFileSync(`./trace-raw-t${THRESHOLD}-turd${TURD}.svg`, svg);
