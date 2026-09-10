import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';

type FormErrorProps = {
  readonly message: string;
  readonly testID?: string;
};

/**
 * Form-level error banner for credentials, validation, and network failures.
 */
export function FormError({ message, testID }: FormErrorProps): JSX.Element {
  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.errorBg,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  message: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
});
