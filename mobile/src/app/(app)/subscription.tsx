import { Redirect, type Href } from 'expo-router';
import type { JSX } from 'react';

/**
 * Subscription management now lives on Me. This route stays so older links open Plans.
 */
export default function SubscriptionRoute(): JSX.Element {
  return <Redirect href={'/(app)/plans' as Href} />;
}
