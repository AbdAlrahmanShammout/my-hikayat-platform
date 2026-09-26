import { ChevronRight, Shield } from 'lucide-react-native';
import { useState, type JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReaderPlatformSettings } from '@/features/platform-settings/hooks/use-reader-platform-settings';
import { openLegalUrl } from '@/features/platform-settings/lib/open-legal-url';
import { theme } from '@/theme/theme';
import { Icon } from '@/ui/primitives/icon';

type LegalLinkRowProps = {
  readonly kind: 'privacy' | 'terms';
  readonly testID?: string;
  readonly withLeadingDivider?: boolean;
};

/**
 * Opens an admin-configured Privacy or Terms URL. Hidden when that URL is null.
 */
export function LegalLinkRow({
  kind,
  testID,
  withLeadingDivider = true,
}: LegalLinkRowProps): JSX.Element | null {
  const settingsQuery = useReaderPlatformSettings();
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const url: string | null =
    kind === 'privacy'
      ? (settingsQuery.data?.privacyPolicyUrl ?? null)
      : (settingsQuery.data?.termsOfServiceUrl ?? null);
  const label: string = kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service';
  const resolvedTestID: string = testID ?? `${kind}-policy-row`;
  if (settingsQuery.isLoading || url === null) {
    return null;
  }
  return (
    <>
      {withLeadingDivider ? <View style={styles.divider} /> : null}
      <Pressable
        style={styles.row}
        onPress={() => {
          if (isOpening) {
            return;
          }
          setIsOpening(true);
          void openLegalUrl(url).finally(() => {
            setIsOpening(false);
          });
        }}
        disabled={isOpening}
        accessibilityRole="link"
        accessibilityLabel={label}
        accessibilityState={{ busy: isOpening, disabled: isOpening }}
        testID={resolvedTestID}
      >
        <Icon icon={Shield} color={theme.colors.textSecondary} size="md" />
        <Text style={styles.label}>{label}</Text>
        <Icon icon={ChevronRight} color={theme.colors.textFaint} size="md" />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.md,
  },
});
