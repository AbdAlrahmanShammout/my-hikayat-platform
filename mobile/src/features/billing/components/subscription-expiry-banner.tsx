import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveSubscriptionExpiryPresentation } from '@/features/billing/lib/resolve-subscription-expiry-presentation';
import { theme } from '@/theme/theme';

export type SubscriptionExpiryBannerPlacement = 'home' | 'me';

/**
 * In-app trial/paid near-expiry and ended awareness (Phase A). Display only — no push.
 */
export function SubscriptionExpiryBanner(input: {
  readonly placement: SubscriptionExpiryBannerPlacement;
}): JSX.Element | null {
  const billing = useReaderSubscription();
  if (billing.isLoading || billing.isError) {
    return null;
  }
  const presentation = resolveSubscriptionExpiryPresentation(billing.subscription);
  if (presentation.kind === 'hidden') {
    return null;
  }
  const showAction: boolean = input.placement === 'home';
  return (
    <View
      style={styles.card}
      testID={`subscription-expiry-banner-${presentation.kind}`}
    >
      <Text style={styles.title}>{presentation.title}</Text>
      <Text style={styles.body}>{presentation.body}</Text>
      {presentation.detailLabel !== null ? (
        <Text style={styles.detail} testID="subscription-expiry-detail">
          {presentation.detailLabel}
        </Text>
      ) : null}
      {showAction ? (
        <Pressable
          style={styles.button}
          onPress={() => {
            router.push('/(app)/(tabs)/profile' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel={presentation.actionLabel}
          testID="subscription-expiry-action"
        >
          <Text style={styles.buttonLabel}>{presentation.actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  title: {
    ...theme.typography.button,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detail: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primaryMuted,
  },
  button: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  buttonLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
});
