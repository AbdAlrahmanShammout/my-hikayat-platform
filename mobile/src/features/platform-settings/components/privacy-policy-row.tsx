import type { JSX } from 'react';

import {
  LegalLinkRow,
} from '@/features/platform-settings/components/legal-link-row';

type PrivacyPolicyRowProps = {
  readonly testID?: string;
  readonly withLeadingDivider?: boolean;
};

/**
 * Opens the admin-configured Privacy Policy URL. Hidden when no URL is set.
 */
export function PrivacyPolicyRow(props: PrivacyPolicyRowProps): JSX.Element | null {
  return <LegalLinkRow kind="privacy" {...props} />;
}
