import {
  resolveReaderEntryCta,
  type ReaderEntryCta,
} from '@/features/billing/lib/resolve-reader-entry-cta';

describe('resolveReaderEntryCta', () => {
  it('opens the reader for trial and paid access', () => {
    const trial: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'trial',
      trialEligible: false,
      subscriptionStatus: 'active',
      hasProgress: false,
      isOnline: true,
    });
    expect(trial.kind).toBe('open_reader');
    expect(trial.label).toBe('Read');
    expect(trial.accessHint).toBe('Free Trial');
    expect(trial.secondaryCtas.map((item) => item.kind)).toEqual(['see_plans']);
    const paid: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'paid',
      trialEligible: false,
      subscriptionStatus: 'active',
      hasProgress: true,
      isOnline: true,
    });
    expect(paid).toEqual({
      kind: 'open_reader',
      label: 'Continue reading',
      accessHint: 'Paid',
      secondaryCtas: [{ kind: 'see_plans', label: 'See plans' }],
    });
  });

  it('routes free eligible users to Start Free Trial', () => {
    const actual: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: true,
      subscriptionStatus: 'active',
      hasProgress: false,
      isOnline: true,
    });
    expect(actual.kind).toBe('go_to_billing');
    expect(actual.label).toBe('Start Free Trial');
    expect(actual.secondaryCtas.map((item) => item.label)).toEqual(['See plans']);
  });

  it('routes canceled paid access to Reactivate as a secondary checkout CTA', () => {
    const actual: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'paid',
      trialEligible: false,
      subscriptionStatus: 'canceled',
      hasProgress: true,
      isOnline: true,
    });
    expect(actual.kind).toBe('open_reader');
    expect(actual.secondaryCtas).toEqual([{ kind: 'reactivate_checkout', label: 'Reactivate' }]);
  });

  it('routes free ineligible users to Subscribe to read', () => {
    const actual: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: false,
      subscriptionStatus: 'active',
      hasProgress: true,
      isOnline: true,
    });
    expect(actual.label).toBe('Subscribe to read');
    expect(actual.kind).toBe('go_to_billing');
  });

  it('falls back to open_reader when offline or access is unknown', () => {
    const offline: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: false,
      subscriptionStatus: 'active',
      hasProgress: false,
      isOnline: false,
    });
    expect(offline.kind).toBe('open_reader');
    expect(offline.label).toBe('Read');
    const unknown: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: undefined,
      trialEligible: undefined,
      subscriptionStatus: undefined,
      hasProgress: true,
      isOnline: true,
    });
    expect(unknown.kind).toBe('open_reader');
    expect(unknown.label).toBe('Continue reading');
    expect(unknown.secondaryCtas).toEqual([]);
  });
});
