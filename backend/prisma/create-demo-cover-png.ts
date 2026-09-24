import { crc32, deflateSync } from 'node:zlib';

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const COLOR_TYPE_TRUECOLOR = 2;
const BIT_DEPTH = 8;

export type DemoCoverRgb = {
  readonly r: number;
  readonly g: number;
  readonly b: number;
};

/**
 * Builds a small solid-color PNG used as a local demo catalog cover.
 */
export function createSolidPng(
  width: number,
  height: number,
  color: DemoCoverRgb,
): Buffer {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart: number = y * (width * 3 + 1);
    raw[rowStart] = 0;
    for (let x = 0; x < width; x += 1) {
      const pixel: number = rowStart + 1 + x * 3;
      raw[pixel] = color.r;
      raw[pixel + 1] = color.g;
      raw[pixel + 2] = color.b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = BIT_DEPTH;
  ihdr[9] = COLOR_TYPE_TRUECOLOR;
  return Buffer.concat([
    PNG_SIGNATURE,
    buildPngChunk('IHDR', ihdr),
    buildPngChunk('IDAT', deflateSync(raw)),
    buildPngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function buildPngChunk(type: string, data: Buffer): Buffer {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBytes: Buffer = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])) >>> 0, 0);
  return Buffer.concat([length, typeBytes, data, crc]);
}
