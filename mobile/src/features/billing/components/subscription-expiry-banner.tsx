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
  const tone = resolveBannerTone(presentation.kind);
  const headline: string =
    presentation.detailLabel !== null
      ? `${presentation.title} · ${presentation.detailLabel}`
      : presentation.title;
  return (
    <View
      style={[styles.card, { backgroundColor: tone.background, borderColor: tone.border }]}
      testID={`subscription-expiry-banner-${presentation.kind}`}
    >
      <Text style={[styles.mark, { color: tone.title }]} accessibilityElementsHidden>
        !
      </Text>
      <View style={styles.copy}>
        <Text style={[styles.title, { color: tone.title }]}>{headline}</Text>
        {input.placement === 'me' ? <Text style={styles.body}>{presentation.body}</Text> : null}
      </View>
      {showAction ? (
        <Pressable
          onPress={() => {
            router.push('/(app)/subscription' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel={presentation.actionLabel}
          testID="subscription-expiry-action"
        >
          <Text style={[styles.action, { color: tone.title }]}>{presentation.actionLabel}</Text>
        </Pressable>
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
    borderRadius: theme.radii.md,
    borderWidth: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  mark: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
  },
  body: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
  },
  action: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    textDecorationLine: 'underline',
  },
});
