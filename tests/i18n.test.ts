import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {de} from '../lib/i18n-de.ts';
import {en} from '../lib/i18n-en.ts';
import {sr} from '../lib/i18n-sr.ts';
import {TRADES} from '../lib/domain.ts';

// Every literal tx("...") in the interface, read from the source files.
function sources(dir: string): string[] {
  return readdirSync(dir).flatMap(f => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? sources(p) : /\.tsx?$/.test(f) ? [p] : [];
  });
}
const literals = new Set<string>();
for (const file of [...sources('app'), ...sources('components'), ...sources('lib')]) {
  const text = readFileSync(file, 'utf8');
  for (const m of text.matchAll(/\btx\(\s*(["'])((?:\\.|(?!\1).)*)\1/g)) {
    const raw = m[2].replace(/\\(["'\\])/g, '$1').replace(/\\n/g, '\n');
    if (/[A-Za-z]/.test(raw)) literals.add(raw.trim()); // skip separators such as ' · '
  }
}

test('every interface text has a German translation', () => {
  const missing = [...literals].filter(k => !(k in de));
  assert.deepEqual(missing, []);
});

test('every trade has a German name', () => {
  for (const t of TRADES) assert.ok(de[t], t);
});

test('English text shown to people no longer talks about roads and potholes', () => {
  const roadWords = /\b(pothole|road|roads|municipality|municipal|lane-km|council|dashcam)\b/i;
  const leftovers = [...literals].filter(k => roadWords.test(en[k] ?? k));
  assert.deepEqual(leftovers, []);
});

test('translations keep their placeholders', () => {
  for (const dict of [de, en]) for (const [k, v] of Object.entries(dict)) {
    const ph = (s: string) => (s.match(/\{\d+\}/g) || []).sort().join();
    assert.equal(ph(v), ph(k), k);
  }
});

test('every interface text has a Serbian translation', () => {
  const missing = [...literals].filter(k => !(k in sr));
  assert.deepEqual(missing, []);
});

test('every trade has a Serbian name', () => {
  for (const t of TRADES) assert.ok(sr[t], t);
});

test('Serbian translations keep their placeholders and are not left in English', () => {
  const ph = (s: string) => (s.match(/\{\d+\}/g) || []).sort().join();
  for (const [k, v] of Object.entries(sr)) assert.equal(ph(v), ph(k), k);
  const same = Object.entries(sr).filter(([k, v]) => k === v && /[a-z]{4,} [a-z]{3,} [a-z]{3,}/i.test(k));
  assert.deepEqual(same.map(([k]) => k), []);
});
