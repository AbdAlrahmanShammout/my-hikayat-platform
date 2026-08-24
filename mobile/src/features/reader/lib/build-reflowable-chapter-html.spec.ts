import { buildReflowableChapterHtml } from '@/features/reader/lib/build-reflowable-chapter-html';

describe('buildReflowableChapterHtml', () => {
  it('wraps chapter body markup in a sandboxed document', () => {
    const actual = buildReflowableChapterHtml({
      title: 'Dawn',
      htmlDocument:
        '<html><body><h1>Dawn</h1><p>The harbor woke early.</p></body></html>',
      fontScalePercent: 120,
    });
    expect(actual).toContain('<title>Dawn</title>');
    expect(actual).toContain('font-size: 120%');
    expect(actual).toContain('The harbor woke early.');
  });
});
