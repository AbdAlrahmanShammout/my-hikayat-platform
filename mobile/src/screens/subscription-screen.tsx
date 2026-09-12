import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscriptionStatusCard } from '@/features/billing/components/subscription-status-card';
import { theme } from '@/theme/theme';
import { BackHeader } from '@/ui/primitives/back-header';

/**
 * Dedicated subscription manager. Billing actions stay server-authoritative.
 */
export function SubscriptionScreen(): JSX.Element {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      testID="subscription-screen"
    >
      <BackHeader
        title="Subscription"
        titleTestID="subscription-title"
        backTestID="subscription-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/profile' as Href);
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <SubscriptionStatusCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
});
