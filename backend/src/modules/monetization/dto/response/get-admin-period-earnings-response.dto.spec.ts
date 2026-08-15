import { GetAdminPeriodEarningsResponseDto } from './get-admin-period-earnings-response.dto';
import { BookRevenueEntity } from '@/modules/monetization/entity/book-revenue.entity';
import { RevenuePeriodEntity } from '@/modules/monetization/entity/revenue-period.entity';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';

describe('GetAdminPeriodEarningsResponseDto', () => {
  it('maps the period earnings page and snapshotted platform cut into the envelope', () => {
    const inputPeriod = new RevenuePeriodEntity({
      id: 4,
      createdAt: new Date('2026-08-01T00:00:00.000Z'),
      updatedAt: new Date('2026-08-01T00:00:00.000Z'),
      startsAt: new Date('2026-08-01T00:00:00.000Z'),
      endsAt: new Date('2026-09-01T00:00:00.000Z'),
      status: RevenuePeriodStatus.OPEN,
      platformCutPercent: 30,
      poolAmountCents: 10000,
    });
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
    const actualResponse = new GetAdminPeriodEarningsResponseDto({
      period: inputPeriod,
      page: { entities: [inputRevenue], total: 2 },
      authorCents: 7000,
      platformCutCents: 3000,
    });
    expect(actualResponse.period.id).toBe(4);
    expect(actualResponse.total).toBe(2);
    expect(actualResponse.authorCents).toBe(7000);
    expect(actualResponse.platformCutCents).toBe(3000);
    expect(actualResponse.bookRevenues[0].authorCents).toBe(2500);
  });
});
