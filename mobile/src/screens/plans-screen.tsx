import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ReaderBillingPlan } from '@/features/billing/api/list-reader-billing-plans';
import { PlanCard } from '@/features/billing/components/plan-card';
import type { ReaderSubscription } from '@/features/billing/api/get-reader-subscription';
import { useReaderBillingPlans } from '@/features/billing/hooks/use-reader-billing-plans';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { theme } from '@/theme/theme';
import { ErrorState } from '@/ui/feedback/error-state';
import { BackHeader } from '@/ui/primitives/back-header';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Catalog of billing plans. Each card is one server plan.
 */
export function PlansScreen(): JSX.Element {
  const plansQuery = useReaderBillingPlans();
  const billing = useReaderSubscription();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [checkingOutPlanId, setCheckingOutPlanId] = useState<number | null>(null);
  async function handleSubscribe(planId: number): Promise<void> {
    setCheckingOutPlanId(planId);
    const message: string | null = await billing.startCheckout(planId);
    setCheckoutMessage(message);
    setCheckingOutPlanId(null);
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID="plans-screen">
      <BackHeader
        title="Plans"
        titleTestID="plans-title"
        backTestID="plans-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/profile' as Href);
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lead}>
          Ask a grown-up before changing billing. Full-book reading follows the plan on the server.
        </Text>
        {plansQuery.isLoading ? <PlansLoading /> : null}
        {plansQuery.isError ? (
          <ErrorState
            description={plansQuery.errorMessage ?? 'Could not load plans.'}
            onRetry={() => {
              void plansQuery.refetch();
            }}
            retryTestID="plans-retry"
            testID="plans-error"
          />
        ) : null}
        {!plansQuery.isLoading && !plansQuery.isError && plansQuery.plans.length === 0 ? (
          <Text style={styles.empty} testID="plans-empty">
            No plans are ready to buy yet. Ask a grown-up to check again later.
          </Text>
        ) : null}
        {!plansQuery.isLoading && !plansQuery.isError
          ? plansQuery.plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={isCurrentPaidPlan({
                  subscription: billing.subscription,
                  plan,
                })}
                isCheckingOut={checkingOutPlanId === plan.id && billing.isCheckingOut}
                onSubscribe={(planId) => {
                  void handleSubscribe(planId);
                }}
              />
            ))
          : null}
        {checkoutMessage !== null ? (
          <Text style={styles.note} testID="plans-checkout-message">
            {checkoutMessage}
          </Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function isCurrentPaidPlan(input: {
  readonly subscription: ReaderSubscription | undefined;
  readonly plan: ReaderBillingPlan;
}): boolean {
  const subscription: ReaderSubscription | undefined = input.subscription;
  if (subscription === undefined) {
    return false;
  }
  return (
    subscription.planId === input.plan.id &&
    subscription.status === 'active' &&
    subscription.readingAccessState === 'paid'
  );
}

function PlansLoading(): JSX.Element {
  return (
    <View testID="plans-loading" style={styles.loading}>
      <Skeleton height={140} width="100%" radius={theme.radii.lg} />
      <Skeleton height={140} width="100%" radius={theme.radii.lg} />
    </View>
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
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  note: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  loading: {
    gap: theme.spacing.md,
  },
});
