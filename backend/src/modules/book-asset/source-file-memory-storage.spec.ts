import { PassThrough } from 'node:stream';

import { sourceFileMemoryStorage } from './source-file-memory-storage';

describe('sourceFileMemoryStorage', () => {
  it('collects the stream into a buffer', async () => {
    const inputStream = new PassThrough();
    const actualInfo = await new Promise<{ buffer: Buffer; size: number }>((resolve, reject) => {
      sourceFileMemoryStorage._handleFile({} as never, { stream: inputStream }, (err, info) => {
        if (err !== null || info === undefined) {
          reject(err ?? new Error('Missing storage info'));
          return;
        }
        resolve(info);
      });
      inputStream.end(Buffer.from('epub-bytes'));
    });
    expect(actualInfo.buffer.equals(Buffer.from('epub-bytes'))).toBe(true);
    expect(actualInfo.size).toBe(10);
  });
});
