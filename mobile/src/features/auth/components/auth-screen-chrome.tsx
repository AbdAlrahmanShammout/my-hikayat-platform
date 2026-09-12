import type { JSX, ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCoverMedia } from '@/features/auth/components/auth-cover-media';
import { useReaderPlatformSettings } from '@/features/platform-settings/hooks/use-reader-platform-settings';
import { theme } from '@/theme/theme';
import { toViewShadow } from '@/ui/lib/to-view-shadow';

type AuthScreenChromeProps = {
  readonly tagline: string;
  readonly children: ReactNode;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
};

const COVER_COLORS = [
  theme.colors.primaryDim,
  theme.colors.secondaryDim,
  theme.colors.amberDim,
  theme.colors.canvasWarm,
  theme.colors.infoBg,
  theme.colors.lockedBg,
] as const;

const COVER_ROTATIONS = ['-2deg', '1.5deg', '0deg', '-1deg', '2deg', '0.5deg'] as const;

/**
 * Direction B auth frame: brand, admin-configured cover media or decorative blocks, and a raised form sheet.
 */
export function AuthScreenChrome({
  tagline,
  children,
  testID,
  accessibilityLabel,
}: AuthScreenChromeProps): JSX.Element {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'right', 'bottom', 'left']}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.brand}>
            <Text style={styles.wordmark} accessibilityRole="header">
              My Hikayat
            </Text>
            <Text style={styles.tagline}>{tagline}</Text>
            <AuthCoverStrip />
          </View>
          <View style={styles.sheet}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AuthCoverStrip(): JSX.Element {
  const settingsQuery = useReaderPlatformSettings();
  const mediaUrl: string | null = settingsQuery.data?.authCoverMediaUrl ?? null;
  if (mediaUrl !== null) {
    return <AuthCoverMedia url={mediaUrl} />;
  }
  return (
    <View style={styles.strip} accessibilityElementsHidden>
      {COVER_COLORS.map((backgroundColor, index) => (
        <View
          key={backgroundColor}
          style={[
            styles.cover,
            toViewShadow(theme.shadows.book),
            { backgroundColor, transform: [{ rotate: COVER_ROTATIONS[index] ?? '0deg' }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
  },
  brand: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  wordmark: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.primary,
  },
  tagline: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.scale.xs,
  },
  strip: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
    overflow: 'hidden',
  },
  cover: {
    width: 68,
    height: 100,
    borderRadius: theme.radii.sm,
  },
  sheet: {
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radii.xxl,
    borderTopRightRadius: theme.radii.xxl,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.md,
  },
});
