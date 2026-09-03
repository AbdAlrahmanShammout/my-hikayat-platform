import { useEffect, useState, type JSX } from 'react';
import { StyleSheet, Text } from 'react-native';

import {
  resolveOfflineLeaseExpiryPresentation,
  type OfflineLeaseExpiryPresentation,
  type OfflineLeaseExpiryState,
} from '@/features/offline/lib/resolve-offline-lease-expiry-presentation';
import { resolveTrustedNow } from '@/storage/offline-trusted-time-storage';
import { theme } from '@/theme/theme';

type OfflineLeaseExpiryLabelProps = {
  readonly expiresAt: string | null | undefined;
  readonly testID?: string;
};

/**
 * Shows leased offline access lifetime using stored expiresAt and trusted time.
 * Display only — open-path lease validation remains fail-closed.
 */
export function OfflineLeaseExpiryLabel(
  props: OfflineLeaseExpiryLabelProps,
): JSX.Element | null {
  const [presentation, setPresentation] = useState<OfflineLeaseExpiryPresentation | null>(
    null,
  );
  useEffect(() => {
    let isCancelled = false;
    void resolveTrustedNow().then((trusted) => {
      if (isCancelled) {
        return;
      }
      setPresentation(
        resolveOfflineLeaseExpiryPresentation({
          expiresAt: props.expiresAt,
          nowMs: trusted.nowMs,
          isClockRollbackDetected: trusted.isClockRollbackDetected,
        }),
      );
    });
    return () => {
      isCancelled = true;
    };
  }, [props.expiresAt]);
  if (presentation === null) {
    return null;
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

const styles = StyleSheet.create({
  label: {
    ...theme.typography.body,
  },
});
