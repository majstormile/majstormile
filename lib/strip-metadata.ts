// Removes hidden metadata from uploaded photos before they are stored (GDPR Art. 5(1)(c), data minimisation).
// Phone cameras write EXIF data into every picture: GPS position, time, device model and serial numbers.
// Baunavi locates jobs by address only, so none of that is kept. The visible picture is left untouched:
// only metadata segments and chunks are dropped; image data is copied byte for byte.

/** JPEG: drop APP1 (EXIF, XMP), APP13 (IPTC/Photoshop) and COM segments. Keeps APP0 (JFIF) and APP2 (ICC colour profile). */
function stripJpeg(b: Buffer): Buffer {
  if (b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return b;
  const parts: Buffer[] = [b.subarray(0, 2)];
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) return b; // not a well-formed marker: leave the file as it was
    const marker = b[i + 1];
    if (marker === 0xff) { i += 1; continue; } // fill byte
    if (marker === 0xda) { parts.push(b.subarray(i)); return Buffer.concat(parts); } // start of scan: the rest is image data
    if (marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { parts.push(b.subarray(i, i + 2)); i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    if (len < 2 || i + 2 + len > b.length) return b;
    const drop = marker === 0xe1 || marker === 0xed || marker === 0xfe || (marker >= 0xe3 && marker <= 0xef && marker !== 0xee);
    if (!drop) parts.push(b.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  return b;
}

/** PNG: drop eXIf, tEXt, zTXt, iTXt and tIME chunks. */
function stripPng(b: Buffer): Buffer {
  const SIG = 8;
  if (b.length < SIG) return b;
  const parts: Buffer[] = [b.subarray(0, SIG)];
  let i = SIG;
  while (i + 12 <= b.length) {
    const len = b.readUInt32BE(i);
    const type = b.toString('latin1', i + 4, i + 8);
    const end = i + 12 + len;
    if (end > b.length) return b;
    if (!['eXIf', 'tEXt', 'zTXt', 'iTXt', 'tIME'].includes(type)) parts.push(b.subarray(i, end));
    i = end;
    if (type === 'IEND') break;
  }
  return Buffer.concat(parts);
}

/** WebP: drop EXIF and XMP chunks and clear their flags in the VP8X header. */
function stripWebp(b: Buffer): Buffer {
  if (b.length < 12 || b.toString('latin1', 0, 4) !== 'RIFF' || b.toString('latin1', 8, 12) !== 'WEBP') return b;
  const parts: Buffer[] = [];
  let i = 12;
  while (i + 8 <= b.length) {
    const type = b.toString('latin1', i, i + 4);
    const len = b.readUInt32LE(i + 4);
    const end = i + 8 + len + (len % 2);
    if (i + 8 + len > b.length) return b;
    if (type === 'VP8X') {
      const chunk = Buffer.from(b.subarray(i, Math.min(end, b.length)));
      chunk[8] &= ~(0x08 | 0x04); // EXIF and XMP present flags
      parts.push(chunk);
    } else if (type !== 'EXIF' && type !== 'XMP ') parts.push(b.subarray(i, Math.min(end, b.length)));
    i = end;
  }
  const body = Buffer.concat(parts);
  const head = Buffer.alloc(12);
  head.write('RIFF', 0, 'latin1'); head.writeUInt32LE(body.length + 4, 4); head.write('WEBP', 8, 'latin1');
  return Buffer.concat([head, body]);
}

/** Returns the image without metadata. Unknown or malformed files are returned unchanged. */
export function stripImageMetadata(bytes: Buffer, mime: string): Buffer {
  try {
    if (mime === 'image/jpeg') return stripJpeg(bytes);
    if (mime === 'image/png') return stripPng(bytes);
    if (mime === 'image/webp') return stripWebp(bytes);
  } catch { /* fall through */ }
  return bytes;
}
