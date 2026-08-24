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
});
