import { resolveReflowableContentProgressPercent } from './resolve-reflowable-content-progress.helper';

describe('resolveReflowableContentProgressPercent', () => {
  const inputChapters = [
    { spineIndex: 0, contentText: 'aaaa' },
    { spineIndex: 1, contentText: 'bbbb' },
    { spineIndex: 2, contentText: 'cccc' },
  ];

  it('returns 0 when there are no chapters or no spine index', () => {
    expect(
      resolveReflowableContentProgressPercent({ spineIndex: 1, chapters: [] }),
    ).toBe(0);
    expect(
      resolveReflowableContentProgressPercent({
        spineIndex: null,
        chapters: inputChapters,
      }),
    ).toBe(0);
  });

  it('uses completed chapter text length, not pageNumber', () => {
    const actualPercent = resolveReflowableContentProgressPercent({
      spineIndex: 2,
      chapters: inputChapters,
    });
    expect(actualPercent).toBe(66);
  });

  it('does not treat the current chapter as completed', () => {
    const actualPercent = resolveReflowableContentProgressPercent({
      spineIndex: 0,
      chapters: inputChapters,
    });
    expect(actualPercent).toBe(0);
  });
});
