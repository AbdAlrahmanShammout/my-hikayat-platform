import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';

export type ReaderEntryCtaKind = 'open_reader' | 'go_to_billing';

export type ReaderEntrySecondaryCta = {
  readonly kind: 'see_plans' | 'reactivate_checkout';
  readonly label: string;
};

export type ReaderEntryCta = {
  readonly kind: ReaderEntryCtaKind;
  readonly label: string;
  readonly accessHint: string | null;
  readonly secondaryCtas: readonly ReaderEntrySecondaryCta[];
};

export type ResolveReaderEntryCtaInput = {
  readonly readingAccessState: ReaderSubscription['readingAccessState'] | undefined;
  readonly trialEligible: boolean | undefined;
  readonly subscriptionStatus: ReaderSubscription['status'] | undefined;
  readonly hasProgress: boolean;
  readonly isOnline: boolean;
};

/**
 * Maps backend readingAccessState / trialEligible into a book-detail primary CTA.
 * Display-only — never invents entitlement; open_reader still relies on server/offline checks.
 */
export function resolveReaderEntryCta(input: ResolveReaderEntryCtaInput): ReaderEntryCta {
  const openLabel: string = input.hasProgress ? 'Continue reading' : 'Read';
  const seePlans: ReaderEntrySecondaryCta = { kind: 'see_plans', label: 'See plans' };
  const reactivate: ReaderEntrySecondaryCta = {
    kind: 'reactivate_checkout',
    label: 'Reactivate',
  };
  const isCanceled: boolean = input.subscriptionStatus === 'canceled';
  if (!input.isOnline) {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: null,
      secondaryCtas: [],
    };
  }
  if (input.readingAccessState === undefined) {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: null,
      secondaryCtas: [],
    };
  }
  if (input.readingAccessState === 'trial') {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: 'Free Trial',
      secondaryCtas: [seePlans],
    };
  }
  if (input.readingAccessState === 'paid') {
    return {
      kind: 'open_reader',
      label: openLabel,
      accessHint: 'Paid',
      secondaryCtas: isCanceled ? [reactivate] : [seePlans],
    };
  }
  if (isCanceled) {
    return {
      kind: 'go_to_billing',
      label: 'Reactivate',
      accessHint: 'Free',
      secondaryCtas: [seePlans],
    };
  }
  if (input.trialEligible === true) {
    return {
      kind: 'go_to_billing',
      label: 'Start Free Trial',
      accessHint: 'Free',
      secondaryCtas: [seePlans],
    };
  }
  return {
    kind: 'go_to_billing',
    label: 'Subscribe to read',
    accessHint: 'Free',
    secondaryCtas: [seePlans],
  };
}
