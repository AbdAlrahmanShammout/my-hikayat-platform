import type { JSX, ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';

type EmptyStateProps = {
  readonly title: string;
  readonly description: string;
  readonly icon?: ReactNode;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly secondaryActionLabel?: string;
  readonly onSecondaryAction?: () => void;
  readonly testID?: string;
};

/**
 * Generic empty-content placeholder. Parents supply copy and actions.
 */
export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  testID,
}: EmptyStateProps): JSX.Element {
  return (
    <View style={styles.wrap} testID={testID}>
      <View style={styles.iconWell}>{icon}</View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel !== undefined && onAction !== undefined ? (
        <Button label={actionLabel} onPress={onAction} isFullWidth={false} />
      ) : null}
      {secondaryActionLabel !== undefined && onSecondaryAction !== undefined ? (
        <Button
          label={secondaryActionLabel}
          onPress={onSecondaryAction}
          variant="secondary"
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
    backgroundColor: theme.colors.canvasWarm,
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
