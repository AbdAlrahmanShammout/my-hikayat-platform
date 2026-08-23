import type { JSX } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { readApiBaseUrlOrPlaceholder } from '../../../config/env';

/**
 * R0 smoke screen. Confirms the app boots and shows env-driven API config.
 * Not a production home screen.
 */
export function BootstrapScreen(): JSX.Element {
  const apiBaseUrl: string = readApiBaseUrlOrPlaceholder();
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.title} accessibilityRole="header">
        Reader
      </Text>
      <Text style={styles.body}>
        Books for ages about 6 and up. Teens and adults are welcome too.
      </Text>
      <Text style={styles.meta}>Bootstrap STEP R0</Text>
      <Text style={styles.meta}>API: {apiBaseUrl}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F4EF',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2933',
  },
  body: {
    fontSize: 18,
    lineHeight: 26,
    color: '#3E4C59',
    maxWidth: 420,
  },
  meta: {
    fontSize: 14,
    color: '#52606D',
  },
});
