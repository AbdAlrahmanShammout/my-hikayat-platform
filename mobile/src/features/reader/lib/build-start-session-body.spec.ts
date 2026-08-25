import { buildStartSessionBody } from './build-start-session-body';

describe('buildStartSessionBody', () => {
  it('returns reflowable spine defaults', () => {
    expect(buildStartSessionBody('reflowable')).toEqual({
      spineIndex: 0,
      scrollOffset: 0,
    });
  });

  it('returns fixed-layout spread defaults', () => {
    expect(buildStartSessionBody('fixed_layout')).toEqual({
      spreadIndex: 0,
      pageNumber: 1,
    });
  });

  it('seeds reflowable start from saved progress', () => {
    expect(
      buildStartSessionBody('reflowable', {
        id: 1,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        userId: 2,
        bookId: 8,
        layoutType: 'reflowable',
        spineIndex: 3,
        scrollOffset: 420,
        spreadIndex: null,
        pageNumber: null,
        lastSessionAt: '2026-01-02T00:00:00.000Z',
      }),
    ).toEqual({
      spineIndex: 3,
      scrollOffset: 420,
    });
  });

  it('seeds fixed-layout start from saved progress', () => {
    expect(
      buildStartSessionBody('fixed_layout', {
        id: 2,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        userId: 2,
        bookId: 9,
        layoutType: 'fixed_layout',
        spineIndex: null,
        scrollOffset: null,
        spreadIndex: 4,
        pageNumber: 7,
        lastSessionAt: '2026-01-02T00:00:00.000Z',
      }),
    ).toEqual({
      spreadIndex: 4,
      pageNumber: 7,
    });
  });
});
