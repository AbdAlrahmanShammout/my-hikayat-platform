import { buildReflowableChapterHtml } from '@/features/reader/lib/build-reflowable-chapter-html';

describe('buildReflowableChapterHtml', () => {
  it('wraps chapter body markup in a sandboxed document', () => {
    const actual = buildReflowableChapterHtml({
      title: 'Dawn',
      htmlDocument:
        '<html><body><h1>Dawn</h1><p>The harbor woke early.</p></body></html>',
      fontScalePercent: 120,
      lineHeight: 1.7,
      marginPx: 22,
      theme: 'light',
    });
    expect(actual).toContain('<title>Dawn</title>');
    expect(actual).toContain('font-size: 120%');
    expect(actual).toContain('line-height: 1.7');
    expect(actual).toContain('padding: 16px 22px 48px');
    expect(actual).toContain('The harbor woke early.');
  });

  it('applies dark theme colors', () => {
    const actual = buildReflowableChapterHtml({
      title: 'Night',
      htmlDocument: '<html><body><p>Lanterns.</p></body></html>',
      fontScalePercent: 110,
      lineHeight: 1.55,
      marginPx: 18,
      theme: 'dark',
    });
    expect(actual).toContain('color-scheme: dark');
    expect(actual).toContain('#1a1714');
  });
});
