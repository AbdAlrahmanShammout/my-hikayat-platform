import { Stack } from 'expo-router';
import type { JSX } from 'react';

/**
 * Nested stack for authenticated book detail and reading shell routes.
 */
export default function BooksLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
