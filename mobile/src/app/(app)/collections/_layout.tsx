import { Stack } from 'expo-router';
import type { JSX } from 'react';

/**
 * Nested stack for curated collection discovery routes.
 */
export default function CollectionsLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
