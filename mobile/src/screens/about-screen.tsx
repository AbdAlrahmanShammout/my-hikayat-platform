import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import type { JSX } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MY_HIKAYAT_ABOUT_FALLBACK } from '@/features/platform-settings/consts/about-mission.constant';
import { LegalLinkRow } from '@/features/platform-settings/components/legal-link-row';
import { useReaderPlatformSettings } from '@/features/platform-settings/hooks/use-reader-platform-settings';
import { theme } from '@/theme/theme';
import { BackHeader } from '@/ui/primitives/back-header';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * About My Hikayat: mission, version, and legal links when URLs exist.
 */
export function AboutScreen(): JSX.Element {
  const settingsQuery = useReaderPlatformSettings();
  const appVersion: string =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.1';
  const mission: string =
    settingsQuery.data?.aboutMission?.trim() || MY_HIKAYAT_ABOUT_FALLBACK;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']} testID="about-screen">
      <BackHeader
        title=""
        backTestID="about-back-button"
        onPressBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace('/(app)/(tabs)/profile' as Href);
        }}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header" testID="about-title">
          About My Hikayat
        </Text>
        {settingsQuery.isLoading ? (
          <View testID="about-loading">
            <Skeleton height={18} width="100%" />
            <Skeleton height={18} width="80%" />
          </View>
        ) : (
          <Text style={styles.mission} testID="about-mission">
            {mission}
          </Text>
        )}
        <Text style={styles.version} testID="about-version">
          {`Version ${appVersion}`}
        </Text>
        <View style={styles.group}>
          <LegalLinkRow kind="privacy" testID="about-privacy-row" withLeadingDivider={false} />
          <LegalLinkRow kind="terms" testID="about-terms-row" />
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
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
  },
  mission: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  version: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  group: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
  },
});
