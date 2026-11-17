import { readFile, writeFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const source = await readFile(new URL('../menu-source.txt', import.meta.url), 'utf8');
const categories = [];
let id = 0;

for (const value of source.replace(/^\uFEFF/, '').split(/\r?\n/)) {
  const line = value.trim();
  if (!line) continue;
  if (line.startsWith('# ')) {
    categories.push({ id: categories.length + 1, name: line.slice(2), items: [] });
    continue;
  }
  const [name, diet, price, description = ''] = line.split('|');
  assert.ok(name && ['', 'V', 'N', 'E'].includes(diet) && /^(from)?\d+$/.test(price), line);
  categories.at(-1).items.push({ id: ++id, name, diet, price, description });
}

assert.equal(categories.length, 30);
assert.equal(id, 266);
assert.ok(categories.every(category => category.items.length));
const asset = path => new URL('../dist/media/' + path, import.meta.url);
if (process.argv.includes('--verify-images')) {
  await Promise.all(['hero.webp', 'favicon.png', ...categories.flatMap(category => category.items.map(item => item.id + '.webp'))]
    .map(path => access(asset(path))));
}
await writeFile(new URL('../dist/menu-data.js', import.meta.url), 'window.parichayamMenu = ' + JSON.stringify(categories) + ';\n');
console.log('Validated ' + id + ' entries across ' + categories.length + ' categories.');
