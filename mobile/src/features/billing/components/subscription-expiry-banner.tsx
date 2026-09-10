import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveSubscriptionExpiryPresentation } from '@/features/billing/lib/resolve-subscription-expiry-presentation';
import { theme } from '@/theme/theme';
import { Button } from '@/ui/primitives/button';

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
  const tone = resolveBannerTone(presentation.kind);
  return (
    <View
      style={[styles.card, { backgroundColor: tone.background, borderColor: tone.border }]}
      testID={`subscription-expiry-banner-${presentation.kind}`}
    >
      <Text style={[styles.title, { color: tone.title }]}>{presentation.title}</Text>
      <Text style={styles.body}>{presentation.body}</Text>
      {presentation.detailLabel !== null ? (
        <Text style={[styles.detail, { color: tone.title }]} testID="subscription-expiry-detail">
          {presentation.detailLabel}
        </Text>
      ) : null}
      {showAction ? (
        <Button
          label={presentation.actionLabel}
          onPress={() => {
            router.push('/(app)/(tabs)/profile' as Href);
          }}
          accessibilityLabel={presentation.actionLabel}
          testID="subscription-expiry-action"
        />
      ) : null}
    </View>
  );
}

function resolveBannerTone(kind: 'trial_approaching' | 'paid_approaching' | 'trial_ended' | 'paid_ended'): {
  readonly background: string;
  readonly border: string;
  readonly title: string;
} {
  if (kind === 'trial_ended' || kind === 'paid_ended') {
    return {
      background: theme.colors.errorBg,
      border: theme.colors.error,
      title: theme.colors.error,
    };
  }
  return {
    background: theme.colors.warningBg,
    border: theme.colors.warning,
    title: theme.colors.warning,
  };
}

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  title: {
    ...theme.typography.button,
    fontSize: theme.typography.scale.lg,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  detail: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
  },
});
