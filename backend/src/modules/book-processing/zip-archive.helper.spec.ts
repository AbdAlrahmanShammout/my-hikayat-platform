import { ZipArchive } from './zip-archive.helper';

describe('ZipArchive', () => {
  it('round-trips stored entries and exposes the first local file', () => {
    const inputArchive = ZipArchive.createStored([
      { name: 'mimetype', data: Buffer.from('application/epub+zip') },
      { name: 'META-INF/container.xml', data: Buffer.from('<container/>') },
    ]);
    const actualArchive = ZipArchive.fromBuffer(inputArchive);
    expect(actualArchive.firstEntryName).toBe('mimetype');
    expect(actualArchive.isFirstEntryStoredWithoutExtra).toBe(true);
    expect(actualArchive.has('META-INF/container.xml')).toBe(true);
    expect(actualArchive.read('mimetype').toString('utf8')).toBe('application/epub+zip');
  });

  it('rejects a buffer that is not a ZIP archive', () => {
    expect(() => ZipArchive.fromBuffer(Buffer.from('%PDF-1.4'))).toThrow();
  });
});
