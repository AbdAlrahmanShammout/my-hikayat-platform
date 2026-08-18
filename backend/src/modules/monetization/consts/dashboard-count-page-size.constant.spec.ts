import { DASHBOARD_COUNT_PAGE_SIZE } from './dashboard-count-page-size.constant';

describe('DASHBOARD_COUNT_PAGE_SIZE', () => {
  it('requests a single row so list totals can be reused without loading pages', () => {
    expect(DASHBOARD_COUNT_PAGE_SIZE).toBe(1);
  });
});
