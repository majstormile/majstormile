import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {stripImageMetadata} from '../lib/strip-metadata.ts';

// Fixtures are 64x36 images whose EXIF holds a GPS position (51°42'25"N 10°0'2"E), a camera maker and a model.
const cases: [string, string][] = [['gps.jpg', 'image/jpeg'], ['gps.png', 'image/png'], ['gps.webp', 'image/webp']];
const has = (b: Buffer, s: string) => b.includes(Buffer.from(s, 'latin1'));

for (const [file, mime] of cases) {
  test(`${file}: GPS and camera data are removed`, () => {
    const before = readFileSync('tests/fixtures/' + file);
    assert.ok(has(before, 'PhoneMaker'), 'fixture carries metadata');
    const after = stripImageMetadata(before, mime);
    assert.ok(after.length < before.length);
    assert.equal(has(after, 'PhoneMaker'), false);
    assert.equal(has(after, 'Model X'), false);
  });
}

test('the image data itself is kept byte for byte (JPEG)', () => {
  const before = readFileSync('tests/fixtures/gps.jpg');
  const after = stripImageMetadata(before, 'image/jpeg');
  const sos = (b: Buffer) => b.subarray(b.indexOf(Buffer.from([0xff, 0xda])));
  assert.deepEqual(sos(after), sos(before));
  assert.deepEqual(after.subarray(0, 2), Buffer.from([0xff, 0xd8]));
});

test('a WebP keeps a valid RIFF size after stripping', () => {
  const after = stripImageMetadata(readFileSync('tests/fixtures/gps.webp'), 'image/webp');
  assert.equal(after.readUInt32LE(4), after.length - 8);
  assert.equal(after.toString('latin1', 8, 12), 'WEBP');
});

test('unknown types and broken files are returned unchanged', () => {
  const junk = Buffer.from('not an image at all');
  assert.equal(stripImageMetadata(junk, 'image/jpeg'), junk);
  assert.equal(stripImageMetadata(junk, 'application/pdf'), junk);
});
