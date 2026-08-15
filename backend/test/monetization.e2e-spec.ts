import type { INestApplication } from '@nestjs/common';

import { MonetizationConfigService } from '@/config/monetization/monetization-config.service';
import { RevenuePeriodStatus } from '@/modules/monetization/enum/general.enum';
import { RevenuePeriodStartsAtConflictException } from '@/modules/monetization/exceptions/revenue-period-starts-at-conflict.exception';
import { RevenuePeriodService } from '@/modules/monetization/revenue-period.service';
import { PrismaProviderService } from '@/providers/database/prisma/prisma-provider.service';

import { createTestingApp } from './create-testing-app';

describe('Monetization domain (e2e)', () => {
  let app: INestApplication | undefined;
  const createdPeriodIds: number[] = [];

  beforeAll(async () => {
    app = await createTestingApp();
  });

  afterAll(async () => {
    if (!app) {
      return;
    }
    const prismaProviderService: PrismaProviderService = app.get(PrismaProviderService);
    if (createdPeriodIds.length > 0) {
      await prismaProviderService.revenuePeriod.deleteMany({
        where: { id: { in: createdPeriodIds } },
      });
    }
    await app.close();
  });

  function getRunningApp(): INestApplication {
    if (!app) {
      throw new Error('Application was not initialized');
    }
    return app;
  }

  it('Given no current period, When the current month is ensured, Then the configured platform cut is snapshotted', async () => {
    const revenuePeriodService: RevenuePeriodService = getRunningApp().get(RevenuePeriodService);
    const monetizationConfigService: MonetizationConfigService =
      getRunningApp().get(MonetizationConfigService);
    const created = await revenuePeriodService.ensureCurrentPeriod(
      new Date('2026-08-15T12:00:00.000Z'),
    );
    createdPeriodIds.push(created.id);
    expect(created.startsAt.toISOString()).toBe('2026-08-01T00:00:00.000Z');
    expect(created.endsAt.toISOString()).toBe('2026-09-01T00:00:00.000Z');
    expect(created.status).toBe(RevenuePeriodStatus.OPEN);
    expect(created.platformCutPercent).toBe(monetizationConfigService.platformCutPercent);
    expect(created.poolAmountCents).toBeNull();
    const ensuredAgain = await revenuePeriodService.ensureCurrentPeriod(
      new Date('2026-08-20T00:00:00.000Z'),
    );
    expect(ensuredAgain.id).toBe(created.id);
    expect(ensuredAgain.platformCutPercent).toBe(created.platformCutPercent);
    await expect(
      revenuePeriodService.createRevenuePeriod({
        startsAt: created.startsAt,
        endsAt: created.endsAt,
        platformCutPercent: 10,
      }),
    ).rejects.toBeInstanceOf(RevenuePeriodStartsAtConflictException);
    const closed = await revenuePeriodService.closeRevenuePeriod(created.id);
    expect(closed.status).toBe(RevenuePeriodStatus.CLOSED);
    const withPool = await revenuePeriodService.updateRevenuePeriod({
      id: created.id,
      poolAmountCents: 1500,
    });
    expect(withPool.poolAmountCents).toBe(1500);
    expect(withPool.platformCutPercent).toBe(created.platformCutPercent);
  });

  it('Given an elapsed open period, When the next month is ensured, Then the elapsed period is closed', async () => {
    const revenuePeriodService: RevenuePeriodService = getRunningApp().get(RevenuePeriodService);
    const elapsed = await revenuePeriodService.createRevenuePeriod({
      startsAt: new Date('2026-07-01T00:00:00.000Z'),
      endsAt: new Date('2026-08-01T00:00:00.000Z'),
      platformCutPercent: 12,
    });
    createdPeriodIds.push(elapsed.id);
    const current = await revenuePeriodService.ensureCurrentPeriod(
      new Date('2026-08-15T12:00:00.000Z'),
    );
    createdPeriodIds.push(current.id);
    const closedElapsed = await revenuePeriodService.getRevenuePeriodById(elapsed.id);
    expect(closedElapsed.status).toBe(RevenuePeriodStatus.CLOSED);
    expect(closedElapsed.platformCutPercent).toBe(12);
    expect(current.startsAt.toISOString()).toBe('2026-08-01T00:00:00.000Z');
  });
});
