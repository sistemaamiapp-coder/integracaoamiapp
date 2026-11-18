import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// O app agora vive na nuvem (Qoder Sites). O link antigo do GitHub Pages é
// somente um redirecionamento, então o "bundle único" é a mesma página.
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const target = 'https://ami-integracao-f04w9wpuzyz.qoder.website/';
if (!html.includes(target)) throw new Error('Destino do redirecionamento não encontrado no index.html');

writeFileSync(join(root, 'ami-integracao-completo.html'), html);
writeFileSync(join(root, 'ami-integracao-completo.txt'), html);
console.log(JSON.stringify({ bytes: Buffer.byteLength(html), target }));
