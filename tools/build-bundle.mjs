import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');
const js = readFileSync(join(root, 'app.js'), 'utf8');
const uri = 'data:image/png;base64,' + readFileSync(join(root, 'assets', 'ami-logo.png')).toString('base64');

let out = html;
out = out.replace(/href="assets\/ami-logo\.png"/g, () => `href="${uri}"`);
out = out.replace(/src="assets\/ami-logo\.png"/g, () => `src="${uri}"`);

const cssInline = css.replace(/url\('assets\/ami-logo\.png'\)/g, () => 'var(--ami-logo)');
const cssTag = '<link rel="stylesheet" href="styles.css">';
if (!out.includes(cssTag)) throw new Error('Link do CSS não encontrado no index.html');
out = out.replace(cssTag, () => `<style>\n:root{--ami-logo:url("${uri}")}\n${cssInline}\n</style>`);

const jsTag = '<script src="app.js"></script>';
if (!out.includes(jsTag)) throw new Error('Script do app não encontrado no index.html');
out = out.replace(jsTag, () => `<script>\n${js}\n</script>`);

if (/assets\/ami-logo\.png|styles\.css|src="app\.js"/.test(out)) throw new Error('Sobrou referência externa no bundle');

writeFileSync(join(root, 'ami-integracao-completo.html'), out);
writeFileSync(join(root, 'ami-integracao-completo.txt'), out);

const uris = out.split('data:image/png;base64,').length - 1;
console.log(JSON.stringify({ bytes: Buffer.byteLength(out), dataUris: uris }));
