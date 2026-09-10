import type { JSX, ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';

type ButtonProps = {
  readonly label: string;
  readonly onPress: () => void;
  readonly variant?: ButtonVariant;
  readonly isDisabled?: boolean;
  readonly isLoading?: boolean;
  readonly icon?: ReactNode;
  readonly isIconOnly?: boolean;
  readonly isFullWidth?: boolean;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
};

type ButtonPalette = {
  readonly background: string;
  readonly borderColor: string;
  readonly borderWidth: number;
  readonly label: string;
  readonly pressedBackground: string;
};

const palettes: Record<ButtonVariant, ButtonPalette> = {
  primary: {
    background: theme.colors.primary,
    borderColor: theme.colors.primary,
    borderWidth: 0,
    label: theme.colors.textOnBrand,
    pressedBackground: theme.colors.primaryHover,
  },
  secondary: {
    background: 'transparent',
    borderColor: theme.colors.borderDefault,
    borderWidth: 1.5,
    label: theme.colors.textSecondary,
    pressedBackground: theme.colors.canvasWarm,
  },
  destructive: {
    background: theme.colors.error,
    borderColor: theme.colors.error,
    borderWidth: 0,
    label: theme.colors.textOnBrand,
    pressedBackground: theme.colors.error,
  },
};

/**
 * Direction B action control. Presentational only — the parent owns the press action.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  isDisabled = false,
  isLoading = false,
  icon,
  isIconOnly = false,
  isFullWidth = true,
  testID,
  accessibilityLabel,
}: ButtonProps): JSX.Element {
  const palette = palettes[variant];
  const isInactive = isDisabled || isLoading;
  const backgroundColor = isDisabled ? theme.colors.textFaint : palette.background;
  const labelColor = isDisabled ? theme.colors.textOnBrand : palette.label;
  return (
    <Pressable
      onPress={onPress}
      disabled={isInactive}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: isLoading }}
      style={({ pressed }) => [
        styles.base,
        isFullWidth && !isIconOnly ? styles.fullWidth : null,
        isIconOnly ? styles.iconOnly : null,
        {
          backgroundColor: pressed && !isInactive ? palette.pressedBackground : backgroundColor,
          borderColor: isDisabled ? theme.colors.textFaint : palette.borderColor,
          borderWidth: palette.borderWidth,
        },
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <View style={styles.content}>
          {icon}
          {isIconOnly ? null : (
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: theme.controlMinHeight,
    minWidth: theme.controlMinHeight,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  iconOnly: {
    width: theme.controlMinHeight,
    paddingHorizontal: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  label: {
    ...theme.typography.button,
  },
});
