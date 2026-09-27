import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const checkout = path.join(root, '.sites/asymmetric-tensor-guide');
const publicDir = path.join(checkout, 'public');
const files = [
  'docs/asymmetric-tensor-cheat-sheet.html',
  'docs/asymmetric-tensor-examples/examples.css',
  'docs/asymmetric-tensor-examples/model.js',
  'docs/asymmetric-tensor-examples/view.js',
  'docs/asymmetric-tensor-examples/charge-geometry.js',
  'docs/asymmetric-tensor-examples/charge-topology.js',
  'docs/charge-rotation-audit.md',
  'RCCM-GfX-2.tex',
  'RCCM-GfX-2.html',
  'RCCM-Condensed.tex',
];

// Publish an explicit reading-package allowlist, never the learning journal
// or the surrounding repository. Keep the original deep-link path available.
for (const file of files) {
  const destination = path.join(publicDir, file);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(path.join(root, file), destination);
}
const guide = readFileSync(path.join(publicDir, files[0]), 'utf8');
writeFileSync(path.join(publicDir, 'index.html'), guide
  .replaceAll('="asymmetric-tensor-examples/', '="docs/asymmetric-tensor-examples/')
  .replaceAll('href="charge-rotation-audit.md"', 'href="docs/charge-rotation-audit.md"'));

const allowed = new Set([...files, 'index.html']);
function verifyDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) verifyDirectory(absolute);
    else if (!allowed.has(path.relative(publicDir, absolute))) {
      throw new Error(`Unexpected public file: ${path.relative(publicDir, absolute)}`);
    }
  }
}
verifyDirectory(publicDir);
for (const file of allowed) {
  if (!/\.(html|js|md)$/.test(file)) continue;
  const text = readFileSync(path.join(publicDir, file), 'utf8');
  const references = file.endsWith('.md')
    ? [...text.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1])
    : [...text.matchAll(/(?:href|src)="([^"]+)"/g)].map(match => match[1]);
  for (const reference of references) {
    if (/^(?:#|https?:|data:)/.test(reference)) continue;
    // HTML inserted by JavaScript resolves against its document, not the JS URL.
    const documents = file.endsWith('.js') ? ['index.html', files[0]] : [file];
    for (const document of documents) {
      const url = new URL(reference, `https://guide.invalid/${document}`);
      const target = path.join(publicDir, decodeURIComponent(url.pathname));
      if (!existsSync(target)) throw new Error(`Missing published reference: ${document} → ${reference}`);
    }
  }
}
console.log(JSON.stringify({ checkout, publicFiles: allowed.size, references: 'verified' }));
