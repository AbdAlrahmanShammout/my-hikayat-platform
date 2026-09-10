import type { JSX } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '@/theme/theme';

type ReaderChromeButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly accessibilityLabel: string;
  readonly testID?: string;
  readonly isDisabled?: boolean;
  readonly tone?: 'light' | 'dark';
};

/**
 * Compact in-reader control. Presentational only — the parent owns the action.
 */
export function ReaderChromeButton({
  label,
  onPress,
  accessibilityLabel,
  testID,
  isDisabled = false,
  tone = 'light',
}: ReaderChromeButtonProps): JSX.Element {
  const color: string = tone === 'dark' ? theme.colors.textOnDark : theme.colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      testID={testID}
      style={[
        styles.button,
        tone === 'dark' ? styles.dark : styles.light,
        isDisabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  light: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  dark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  disabled: {
    opacity: 0.35,
  },
  label: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
  },
});
