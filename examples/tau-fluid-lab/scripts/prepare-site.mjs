import { copyFile } from 'node:fs/promises';

// The public homepage opens the continuous experiment. Preserve the complete
// study gallery and every original experiment route in the static export.
const output = new URL('../dist/', import.meta.url);
await copyFile(new URL('index.html', output), new URL('lab.html', output));
await copyFile(new URL('atom.html', output), new URL('index.html', output));
