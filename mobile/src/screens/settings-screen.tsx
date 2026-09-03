import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOfflinePackages } from '@/features/offline/hooks/use-offline-packages';
import { ReflowableReaderSettingsControls } from '@/features/reader/components/reflowable-reader-settings-controls';
import { usePersistedReflowableReaderSettings } from '@/features/reader/hooks/use-persisted-reflowable-reader-settings';
import { theme } from '@/theme/theme';

/**
 * Minimal Settings: device reading prefs, downloads summary, about.
 * No invented toggles (notifications, Wi-Fi-only, language, etc.).
 */
export function SettingsScreen(): JSX.Element {
  const readingPrefs = usePersistedReflowableReaderSettings();
  const offline = useOfflinePackages();
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const downloadCount: number = offline.packages.length;
  const appVersion: string =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.1';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID="settings-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/(app)/(tabs)/profile' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="settings-back-button"
        >
          <Text style={styles.backLabel}>Back</Text>
        </Pressable>
        <Text style={styles.title} accessibilityRole="header" testID="settings-title">
          Settings
        </Text>
        <Text style={styles.lead}>
          Only preferences that affect reading and downloads on this device.
        </Text>

        <Text style={styles.sectionTitle}>Reading</Text>
        <Text style={styles.body}>
          Defaults for reflowable books. Changes here and in the reader are saved on this device.
        </Text>
        {readingPrefs.isLoading ? (
          <ActivityIndicator color={theme.colors.primary} testID="settings-reading-loading" />
        ) : (
          <>
            <Text style={styles.meta} testID="settings-reading-summary">
              {`Font ${readingPrefs.settings.fontScalePercent}% · Line ${readingPrefs.settings.lineHeight} · Margin ${readingPrefs.settings.marginPx}px · ${readingPrefs.settings.theme}`}
            </Text>
            <ReflowableReaderSettingsControls
              settings={readingPrefs.settings}
              onDecreaseFont={readingPrefs.decreaseFont}
              onIncreaseFont={readingPrefs.increaseFont}
              onDecreaseLine={readingPrefs.decreaseLine}
              onIncreaseLine={readingPrefs.increaseLine}
              onDecreaseMargin={readingPrefs.decreasePageMargin}
              onIncreaseMargin={readingPrefs.increasePageMargin}
              onToggleTheme={readingPrefs.toggleTheme}
              testIDPrefix="settings"
            />
            <Pressable
              style={styles.secondaryButton}
              disabled={isResetting}
              onPress={() => {
                setIsResetting(true);
                void readingPrefs.resetToDefaults().finally(() => {
                  setIsResetting(false);
                });
              }}
              accessibilityRole="button"
              accessibilityLabel="Reset reading defaults"
              testID="settings-reading-reset"
            >
              <Text style={styles.secondaryLabel}>Reset reading defaults</Text>
            </Pressable>
          </>
        )}

        <Text style={styles.sectionTitle}>Downloads</Text>
        <Text style={styles.body} testID="settings-downloads-summary">
          {offline.isLoading
            ? 'Checking downloads…'
            : downloadCount === 0
              ? 'No books downloaded on this device.'
              : downloadCount === 1
                ? '1 book downloaded on this device.'
                : `${downloadCount} books downloaded on this device.`}
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            router.push('/(app)/(tabs)/library' as Href);
          }}
          accessibilityRole="button"
          accessibilityLabel="Open My books"
          testID="settings-open-my-books"
        >
          <Text style={styles.secondaryLabel}>Manage downloads in My books</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.body} testID="settings-about-version">
          {`Reader app · version ${appVersion}`}
        </Text>
        <Text style={styles.meta}>
          Sign out stays on Me. Password reset and notifications are not available yet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  backButton: {
    alignSelf: 'flex-start',
    minHeight: 44,
    justifyContent: 'center',
  },
  backLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
  title: {
    ...theme.typography.title,
    color: theme.colors.textPrimary,
  },
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  meta: {
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  secondaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  secondaryLabel: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
});
