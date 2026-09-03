import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

export type ReaderEntryCtaKind = 'open_reader' | 'go_to_billing';

export type ReaderEntryCta = {
  readonly kind: ReaderEntryCtaKind;
  readonly label: string;
  readonly accessHint: string | null;
};

export type ResolveReaderEntryCtaInput = {
  readonly readingAccessState: ReaderSubscription['readingAccessState'] | undefined;
  readonly trialEligible: boolean | undefined;
  readonly hasProgress: boolean;
  readonly isOnline: boolean;
};

/**
 * Maps backend readingAccessState / trialEligible into a book-detail primary CTA.
 * Display-only — never invents entitlement; open_reader still relies on server/offline checks.
 */
export function resolveReaderEntryCta(input: ResolveReaderEntryCtaInput): ReaderEntryCta {
  const openLabel: string = input.hasProgress ? 'Continue reading' : 'Read';
  if (!input.isOnline) {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: null,
    };
  }
  if (input.readingAccessState === undefined) {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: null,
    };
  }
  if (input.readingAccessState === 'trial') {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: 'Free Trial',
    };
  }
  if (input.readingAccessState === 'paid') {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: 'Paid',
    };
  }
  if (input.trialEligible === true) {
    return {
      kind: 'go_to_billing',
      label: 'Start Free Trial',
      accessHint: 'Free',
    };
  }
  return {
    kind: 'go_to_billing',
    label: 'Subscribe to read',
    accessHint: 'Free',
  };
}
