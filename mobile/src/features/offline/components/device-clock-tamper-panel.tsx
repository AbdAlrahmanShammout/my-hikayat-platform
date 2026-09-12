import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';

type DeviceClockTamperPanelProps = {
  readonly onReconnect: () => void;
  readonly isReconnecting?: boolean;
  readonly reconnectTestID?: string;
};

/**
 * Figma DeviceClockTamperScreen chrome. Retry stays in the parent; no entitlement rules.
 */
export function DeviceClockTamperPanel({
  onReconnect,
  isReconnecting = false,
  reconnectTestID = 'device-clock-reconnect-button',
}: DeviceClockTamperPanelProps): JSX.Element {
  return (
    <View style={styles.wrap} testID="device-clock-tamper-panel">
      <View style={styles.iconWell} accessibilityElementsHidden>
        <Text style={styles.iconMark}>!</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        Your device time changed
      </Text>
      <Text style={styles.body}>
        We noticed your device clock changed. To protect your offline books, please reconnect to the
        internet to verify your access.
      </Text>
      <Button
        label="Reconnect to unlock"
        onPress={onReconnect}
        isLoading={isReconnecting}
        accessibilityLabel="Reconnect to unlock"
        testID={reconnectTestID}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    gap: theme.spacing.sm,
    alignSelf: 'stretch',
  },
  iconWell: {
    width: theme.spacing.xxxl + theme.spacing.lg,
    height: theme.spacing.xxxl + theme.spacing.lg,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.scale.xs,
  },
  iconMark: {
    ...theme.typography.title,
    color: theme.colors.warning,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale['2xl'],
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
});
