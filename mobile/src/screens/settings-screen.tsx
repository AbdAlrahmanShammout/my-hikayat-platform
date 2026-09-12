import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOfflinePackages } from '@/features/offline/hooks/use-offline-packages';
import { LegalLinkRow } from '@/features/platform-settings/components/legal-link-row';
import { ReflowableReaderSettingsControls } from '@/features/reader/components/reflowable-reader-settings-controls';
import { usePersistedReflowableReaderSettings } from '@/features/reader/hooks/use-persisted-reflowable-reader-settings';
import { theme } from '@/theme/theme';
import { BackHeader } from '@/ui/primitives/back-header';
import { Button } from '@/ui/primitives/button';
import { Skeleton } from '@/ui/primitives/skeleton';

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
      <BackHeader
        title=""
        backTestID="settings-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/profile' as Href);
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="settings-title">
          Settings
        </Text>
        <Text style={styles.lead}>
          Only preferences that affect reading and downloads on this device.
        </Text>

        <Text style={styles.sectionLabel}>Reading</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody}>
            Defaults for reflowable books. Changes here and in the reader are saved on this device.
          </Text>
          {readingPrefs.isLoading ? (
            <View testID="settings-reading-loading" style={styles.loadingBlock}>
              <Skeleton height={16} width="80%" />
              <Skeleton height={44} width="100%" />
            </View>
          ) : (
            <>
              <Text style={styles.meta} testID="settings-reading-summary">
                {`Font ${readingPrefs.settings.fontScalePercent}% · Line ${readingPrefs.settings.lineHeight} · Margin ${readingPrefs.settings.marginPx}px · ${readingPrefs.settings.theme}`}
              </Text>
              <ReflowableReaderSettingsControls
                settings={readingPrefs.settings}
                onApplySettings={readingPrefs.applySettings}
                onToggleTheme={readingPrefs.toggleTheme}
                themeControl="switch"
                testIDPrefix="settings"
              />
              <Button
                label="Reset reading defaults"
                variant="secondary"
                isDisabled={isResetting}
                isLoading={isResetting}
                onPress={() => {
                  setIsResetting(true);
                  void readingPrefs.resetToDefaults().finally(() => {
                    setIsResetting(false);
                  });
                }}
                accessibilityLabel="Reset reading defaults"
                testID="settings-reading-reset"
              />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>Downloads</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody} testID="settings-downloads-summary">
            {offline.isLoading
              ? 'Checking downloads…'
              : downloadCount === 0
                ? 'No books downloaded on this device.'
                : downloadCount === 1
                  ? '1 book downloaded on this device.'
                  : `${downloadCount} books downloaded on this device.`}
          </Text>
          <Pressable
            style={styles.row}
            onPress={() => {
              router.push('/(app)/(tabs)/library' as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel="Open My Books"
            testID="settings-open-my-books"
          >
            <Text style={styles.rowLabel}>Manage downloads in My Books</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Text style={styles.cardBody} testID="settings-about-version">
            {`My Hikayat · version ${appVersion}`}
          </Text>
          <LegalLinkRow kind="privacy" testID="settings-privacy-policy-row" withLeadingDivider={false} />
          <LegalLinkRow kind="terms" testID="settings-terms-row" />
          <Text style={styles.meta}>
            Sign out stays on Me. Notification preferences are not available yet.
          </Text>
        </View>
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
    gap: theme.spacing.sm,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  lead: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.cardInner,
    gap: theme.spacing.sm,
  },
  cardBody: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  meta: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  loadingBlock: {
    gap: theme.spacing.sm,
  },
  row: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.primary,
    flex: 1,
  },
  chevron: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    color: theme.colors.textFaint,
  },
});
