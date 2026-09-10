import type { JSX } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useOfflineLeaseExpiryPresentation } from '@/features/offline/hooks/use-offline-lease-expiry-presentation';
import type { OfflineLeaseExpiryState } from '@/features/offline/lib/resolve-offline-lease-expiry-presentation';
import { theme } from '@/theme/theme';
import { Pill, type PillVariant } from '@/ui/primitives/pill';

type OfflineLeaseExpiryLabelProps = {
  readonly expiresAt: string | null | undefined;
  readonly appearance?: 'text' | 'chip';
  readonly testID?: string;
};

/**
 * Shows leased offline access lifetime using stored expiresAt and trusted time.
 * Display only — open-path lease validation remains fail-closed.
 */
export function OfflineLeaseExpiryLabel(
  props: OfflineLeaseExpiryLabelProps,
): JSX.Element | null {
  const presentation = useOfflineLeaseExpiryPresentation(props.expiresAt);
  if (presentation === null) {
    return null;
  }
  if (props.appearance === 'chip') {
    return (
      <Pill
        label={presentation.label}
        variant={resolveChipVariant(presentation.state)}
        testID={props.testID}
      />
    );
  }
  return (
    <Text
      style={[styles.label, { color: resolveLabelColor(presentation.state) }]}
      testID={props.testID}
      accessibilityRole="text"
    >
      {presentation.label}
    </Text>
  );
}

function resolveLabelColor(state: OfflineLeaseExpiryState): string {
  if (state === 'expired' || state === 'clock_rollback' || state === 'unavailable') {
    return theme.colors.danger;
  }
  if (state === 'approaching') {
    return theme.colors.primaryMuted;
  }
  return theme.colors.textMuted;
}

function resolveChipVariant(state: OfflineLeaseExpiryState): PillVariant {
  if (state === 'active') {
    return 'success';
  }
  if (state === 'approaching' || state === 'clock_rollback') {
    return 'warning';
  }
  return 'locked';
}

const styles = StyleSheet.create({
  label: {
    ...theme.typography.body,
  },
});
