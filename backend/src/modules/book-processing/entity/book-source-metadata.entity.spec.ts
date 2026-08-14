import { BookSourceMetadataEntity } from './book-source-metadata.entity';

describe('BookSourceMetadataEntity', () => {
  it('holds extracted OPF package metadata', () => {
    const actualEntity = new BookSourceMetadataEntity({
      id: 3,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      bookId: 8,
      packagePath: 'OEBPS/content.opf',
      epubVersion: '3.0',
      identifier: 'urn:uuid:test',
      title: 'The Last Lighthouse',
      language: 'en',
      creator: 'Jane Author',
      publisher: null,
      description: null,
    });
    expect(actualEntity.bookId).toBe(8);
    expect(actualEntity.epubVersion).toBe('3.0');
    expect(actualEntity.title).toBe('The Last Lighthouse');
    expect(actualEntity.creator).toBe('Jane Author');
  });
});
