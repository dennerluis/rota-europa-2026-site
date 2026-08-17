import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
for (const file of ['index.html', 'style.css', 'app.js', 'manifest.json', 'sw.js', 'assets/icon.png']) {
  assert.equal(existsSync(join(root, file)), true, `Arquivo ausente: ${file}`);
}

const html = readFileSync(join(root, 'index.html'), 'utf8');
const manifest = JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8'));
const app = readFileSync(join(root, 'app.js'), 'utf8');

assert.match(html, /Rota Europa 2026/);
assert.match(html, /\.\/manifest\.json/);
assert.doesNotMatch(html, /src="\/assets\//);
assert.equal(manifest.display, 'standalone');
assert.match(app, /Google Maps/);
assert.match(app, /\.\/assets\/amsterdam\.jpg/);
assert.match(app, /register\('\.\/sw\.js'\)/);
assert.match(app, /localStorage/);
console.log('Static site smoke tests passed');
