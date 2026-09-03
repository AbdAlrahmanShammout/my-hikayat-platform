import {
  resolveReaderEntryCta,
  type ReaderEntryCta,
} from '@/features/billing/lib/resolve-reader-entry-cta';

describe('resolveReaderEntryCta', () => {
  it('opens the reader for trial and paid access', () => {
    const trial: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'trial',
      trialEligible: false,
      hasProgress: false,
      isOnline: true,
    });
    expect(trial).toEqual({
      kind: 'open_reader',
      label: 'Read',
      accessHint: 'Free Trial',
    });
    const paid: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'paid',
      trialEligible: false,
      hasProgress: true,
      isOnline: true,
    });
    expect(paid).toEqual({
      kind: 'open_reader',
      label: 'Continue reading',
      accessHint: 'Paid',
    });
  });

  it('routes free eligible users to Start Free Trial', () => {
    const actual: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: true,
      hasProgress: false,
      isOnline: true,
    });
    expect(actual).toEqual({
      kind: 'go_to_billing',
      label: 'Start Free Trial',
      accessHint: 'Free',
    });
  });

  it('routes free ineligible users to Subscribe to read', () => {
    const actual: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: false,
      hasProgress: true,
      isOnline: true,
    });
    expect(actual).toEqual({
      kind: 'go_to_billing',
      label: 'Subscribe to read',
      accessHint: 'Free',
    });
  });

  it('falls back to open_reader when offline or access is unknown', () => {
    const offline: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: 'free',
      trialEligible: false,
      hasProgress: false,
      isOnline: false,
    });
    expect(offline.kind).toBe('open_reader');
    expect(offline.label).toBe('Read');
    const unknown: ReaderEntryCta = resolveReaderEntryCta({
      readingAccessState: undefined,
      trialEligible: undefined,
      hasProgress: true,
      isOnline: true,
    });
    expect(unknown).toEqual({
      kind: 'open_reader',
      label: 'Continue reading',
      accessHint: null,
    });
  });
});
