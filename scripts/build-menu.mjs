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
const asset = path => new URL('../public/media/' + path, import.meta.url);
if (process.argv.includes('--verify-images')) {
  const items = categories.flatMap(category => category.items);
  const copy = JSON.parse(await readFile(new URL('../src/data/dish-editorial.json', import.meta.url), 'utf8'));
  assert.equal(Object.keys(copy).length, items.length, 'Editorial coverage');
  assert.equal(new Set(Object.values(copy).map(entry => entry.description)).size, items.length, 'Unique dish descriptions');
  for (const { name } of items) {
    const entry = copy[name];
    assert.ok(entry?.description?.trim(), 'Missing description for ' + name);
    assert.equal(entry.suggestions.length, 3, 'Kitchen suggestions for ' + name);
    assert.ok(entry.suggestions.every(suggestion => suggestion.trim()), 'Empty suggestion for ' + name);
    assert.equal(new Set(entry.suggestions).size, 3, 'Unique suggestions for ' + name);
  }
  const thumbs = [0, ...categories.map(category => category.id)].map(category => 'categories/' + category + '.webp');
  await Promise.all(['hero.webp', 'hero-small.webp', ...items.map(item => item.id + '.webp'), ...thumbs]
    .map(path => access(asset(path))));
  await access(new URL('../public/brand/favicon.svg', import.meta.url));
}
await writeFile(new URL('../src/data/menu.json', import.meta.url), JSON.stringify(categories, null, 2) + '\n');
console.log('Validated ' + id + ' entries across ' + categories.length + ' categories.');
