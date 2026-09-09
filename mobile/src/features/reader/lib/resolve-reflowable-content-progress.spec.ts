import { resolveReflowableContentProgress } from '@/features/reader/lib/resolve-reflowable-content-progress';

describe('resolveReflowableContentProgress', () => {
  it('returns 0 at the first chapter', () => {
    const actualPercent = resolveReflowableContentProgress({
      spineIndex: 0,
      chapters: [
        { htmlDocument: '<p>Short</p>' },
        { htmlDocument: '<p>This chapter is much longer than the first one.</p>' },
      ],
    });
    expect(actualPercent).toBe(0);
  });

  it('weights progress by chapter text length, not chapter count or pages', () => {
    const actualPercent = resolveReflowableContentProgress({
      spineIndex: 1,
      chapters: [
        { htmlDocument: '<p>aa</p>' },
        { htmlDocument: '<p>bbbbbbbb</p>' },
      ],
    });
    expect(actualPercent).toBe(20);
  });

  it('does not change when markup wrapping the same text changes', () => {
    const actualPlain = resolveReflowableContentProgress({
      spineIndex: 1,
      chapters: [{ htmlDocument: 'Hello world' }, { htmlDocument: 'Next' }],
    });
    const actualMarkup = resolveReflowableContentProgress({
      spineIndex: 1,
      chapters: [
        { htmlDocument: '<div><p>Hello world</p></div>' },
        { htmlDocument: '<p>Next</p>' },
      ],
    });
    expect(actualMarkup).toBe(actualPlain);
  });

  it('falls back to equal chapter weight when chapters have no text', () => {
    const actualPercent = resolveReflowableContentProgress({
      spineIndex: 1,
      chapters: [{ htmlDocument: '<div></div>' }, { htmlDocument: '<p>  </p>' }],
    });
    expect(actualPercent).toBe(50);
  });

  it('returns 0 when there are no chapters', () => {
    const actualPercent = resolveReflowableContentProgress({
      spineIndex: 0,
      chapters: [],
    });
    expect(actualPercent).toBe(0);
  });
});
