import { SOURCE_FILE_UPLOAD } from './source-file-upload.constant';

describe('SOURCE_FILE_UPLOAD', () => {
  it('caps source uploads at 100 MiB for the file field', () => {
    expect(SOURCE_FILE_UPLOAD.fieldName).toBe('file');
    expect(SOURCE_FILE_UPLOAD.maxBytes).toBe(104_857_600);
    expect(SOURCE_FILE_UPLOAD.contentTypes).toEqual([
      'application/epub+zip',
      'application/epub',
      'application/pdf',
    ]);
    expect(SOURCE_FILE_UPLOAD.extensions).toEqual(['.epub', '.pdf']);
  });
});
