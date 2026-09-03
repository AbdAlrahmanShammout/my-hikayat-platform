import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ReflowableReaderSettings } from '@/features/reader/lib/reflowable-reader-settings';
import { theme } from '@/theme/theme';

type ReflowableReaderSettingsControlsProps = {
  readonly settings: ReflowableReaderSettings;
  readonly onIncreaseFont: () => void;
  readonly onDecreaseFont: () => void;
  readonly onIncreaseLine: () => void;
  readonly onDecreaseLine: () => void;
  readonly onIncreaseMargin: () => void;
  readonly onDecreaseMargin: () => void;
  readonly onToggleTheme: () => void;
  readonly testIDPrefix?: string;
};

/**
 * Shared controls for reflowable font, spacing, margin, and theme.
 */
export function ReflowableReaderSettingsControls(
  props: ReflowableReaderSettingsControlsProps,
): JSX.Element {
  const prefix: string = props.testIDPrefix ?? 'reader';
  return (
    <View style={styles.row} testID={`${prefix}-reflowable-settings`}>
      <SettingsButton
        label="A−"
        accessibilityLabel="Decrease font size"
        testID={`${prefix}-font-decrease`}
        onPress={props.onDecreaseFont}
      />
      <SettingsButton
        label="A+"
        accessibilityLabel="Increase font size"
        testID={`${prefix}-font-increase`}
        onPress={props.onIncreaseFont}
      />
      <SettingsButton
        label="Line −"
        accessibilityLabel="Decrease line spacing"
        testID={`${prefix}-line-decrease`}
        onPress={props.onDecreaseLine}
      />
      <SettingsButton
        label="Line +"
        accessibilityLabel="Increase line spacing"
        testID={`${prefix}-line-increase`}
        onPress={props.onIncreaseLine}
      />
      <SettingsButton
        label="Margin −"
        accessibilityLabel="Decrease margin"
        testID={`${prefix}-margin-decrease`}
        onPress={props.onDecreaseMargin}
      />
      <SettingsButton
        label="Margin +"
        accessibilityLabel="Increase margin"
        testID={`${prefix}-margin-increase`}
        onPress={props.onIncreaseMargin}
      />
      <SettingsButton
        label={props.settings.theme === 'light' ? 'Dark' : 'Light'}
        accessibilityLabel="Toggle reading theme"
        testID={`${prefix}-theme-toggle`}
        onPress={props.onToggleTheme}
      />
    </View>
  );
}

function SettingsButton(input: {
  readonly label: string;
  readonly accessibilityLabel: string;
  readonly testID: string;
  readonly onPress: () => void;
}): JSX.Element {
  return (
    <Pressable
      style={styles.button}
      onPress={input.onPress}
      accessibilityRole="button"
      accessibilityLabel={input.accessibilityLabel}
      testID={input.testID}
    >
      <Text style={styles.label}>{input.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  button: {
    minHeight: 44,
    minWidth: 44,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
