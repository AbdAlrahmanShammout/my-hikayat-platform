import type { JSX } from 'react';

import { LegalLinkRow } from '@/features/platform-settings/components/legal-link-row';

type TermsOfServiceRowProps = {
  readonly testID?: string;
  readonly withLeadingDivider?: boolean;
};

/**
 * Opens the admin-configured Terms of Service URL. Hidden when no URL is set.
 */
export function TermsOfServiceRow(props: TermsOfServiceRowProps): JSX.Element | null {
  return <LegalLinkRow kind="terms" {...props} />;
}
