import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';

type ErrorStateProps = {
  readonly title?: string;
  readonly description: string;
  readonly icon?: ReactNode;
  readonly retryLabel?: string;
  readonly onRetry?: () => void;
  readonly retryTestID?: string;
  readonly secondaryActionLabel?: string;
  readonly onSecondaryAction?: () => void;
  readonly testID?: string;
};

/**
 * Recoverable error placeholder. Retry stays in the parent screen.
 */
export function ErrorState({
  title = 'Something went wrong',
  description,
  icon,
  retryLabel = 'Try Again',
  onRetry,
  retryTestID,
  secondaryActionLabel,
  onSecondaryAction,
  testID,
}: ErrorStateProps): JSX.Element {
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.iconWell}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {onRetry !== undefined ? (
        <Button
          label={retryLabel}
          onPress={onRetry}
          variant="secondary"
          isFullWidth={false}
          testID={retryTestID}
        />
      ) : null}
      {secondaryActionLabel !== undefined && onSecondaryAction !== undefined ? (
        <Button
          label={secondaryActionLabel}
          onPress={onSecondaryAction}
          variant="primary"
          isFullWidth={false}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xxl,
    paddingVertical: theme.spacing.xxxl,
    gap: theme.spacing.sm,
  },
  iconWell: {
    width: theme.spacing.xxxl + theme.spacing.lg,
    height: theme.spacing.xxxl + theme.spacing.lg,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.scale.xs,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    textAlign: 'center',
    color: theme.colors.textPrimary,
  },
  description: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.textMuted,
  },
});
