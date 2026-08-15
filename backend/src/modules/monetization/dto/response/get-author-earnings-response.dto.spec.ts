import { GetAuthorEarningsResponseDto } from './get-author-earnings-response.dto';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';

describe('GetAuthorEarningsResponseDto', () => {
  it('maps the earnings page and owner total into the envelope', () => {
    const inputRevenue = new BookRevenueEntity({
      id: 1,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      revenuePeriodId: 4,
      bookId: 8,
      ownerId: 3,
      weightedEngagement: 2.5,
      poolShareCents: 3571,
      platformCutCents: 1071,
      authorCents: 2500,
    });
    const actualResponse = new GetAuthorEarningsResponseDto({
      page: { entities: [inputRevenue], total: 2 },
      authorCents: 7000,
    });
    expect(actualResponse.total).toBe(2);
    expect(actualResponse.authorCents).toBe(7000);
    expect(actualResponse.bookRevenues[0].authorCents).toBe(2500);
  });
});
