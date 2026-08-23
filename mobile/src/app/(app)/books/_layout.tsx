import { Stack } from 'expo-router';
import type { JSX } from 'react';

/**
 * Nested stack for authenticated non-tab routes (book detail, later readers).
 */
export default function BooksLayout(): JSX.Element {
  return <Stack screenOptions={{ headerShown: false }} />;
}
