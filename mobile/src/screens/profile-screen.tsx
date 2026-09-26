import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect, type Href } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  Info,
  LogOut,
  Settings,
  Sparkles,
} from 'lucide-react-native';
import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscriptionExpiryBanner } from '@/features/billing/components/subscription-expiry-banner';
import { SubscriptionSummaryCard } from '@/features/billing/components/subscription-summary-card';
import { useReaderSubscription } from '@/features/billing/hooks/use-reader-subscription';
import { resolveHomeGreeting } from '@/features/home/lib/resolve-home-greeting';
import { useOfflinePackages } from '@/features/offline/hooks/use-offline-packages';
import {
  buildOfflinePurgeConfirmCopy,
  type OfflinePurgeConfirmCopy,
} from '@/features/offline/lib/confirm-offline-purge-if-needed';
import { listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import { LegalLinkRow } from '@/features/platform-settings/components/legal-link-row';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { ErrorState } from '@/ui/feedback/error-state';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { SheetHeader } from '@/ui/layout/sheet-header';
import { AppToolbar } from '@/ui/navigation/app-toolbar';
import { Button } from '@/ui/primitives/button';
import { Icon } from '@/ui/primitives/icon';
import { Skeleton } from '@/ui/primitives/skeleton';

/**
 * Profile tab: identity from /auth/me, expiry awareness, subscription summary, settings, sign-out.
 */
export function ProfileScreen(): JSX.Element {
  const { user, signOut } = useSession();
  const billing = useReaderSubscription();
  const offline = useOfflinePackages();
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);
  const [purgeCopy, setPurgeCopy] = useState<OfflinePurgeConfirmCopy | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState<boolean>(true);
  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => {
        setIsScreenFocused(false);
      };
    }, []),
  );

  async function executeSignOut(): Promise<void> {
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
      setPurgeCopy(null);
    }
  }

  async function handleSignOutPress(): Promise<void> {
    const packages = await listOfflineManifests();
    setPurgeCopy(
      buildOfflinePurgeConfirmCopy({
        kind: 'sign_out',
        packageCount: packages.length,
      }),
    );
  }

  if (user === null) {
    return (
      <View style={styles.root} testID="shell-profile-screen">
        {isScreenFocused ? <StatusBar style="light" /> : null}
        <AppToolbar
          showLogo
          tone="brand"
          title="Me"
          titleTestID="shell-profile-title"
          includeSafeArea
          testID="shell-profile-toolbar"
        />
        <View style={styles.loadingBlock} testID="shell-profile-loading">
          <Skeleton height={56} width={56} radius={theme.radii.full} />
          <Skeleton height={18} width="60%" />
          <Skeleton height={120} width="100%" />
        </View>
      </View>
    );
  }

  const greeting = resolveHomeGreeting({
    displayName: user.displayName,
    email: user.email,
  });
  const initial: string = resolveIdentityInitial(greeting.name, user.email);
  const downloadCount: number = offline.packages.length;
  const appVersion: string =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? '0.0.1';

  return (
    <View style={styles.root} testID="shell-profile-screen">
      {isScreenFocused ? <StatusBar style="light" /> : null}
      <AppToolbar
        showLogo
        tone="brand"
        title="Me"
        titleTestID="shell-profile-title"
        includeSafeArea
        testID="shell-profile-toolbar"
      />
      <SafeAreaView style={styles.body} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identity}>
            <View style={styles.avatar} accessibilityElementsHidden>
              <Text style={styles.avatarMark}>{initial}</Text>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.email} testID="shell-profile-email">
                {greeting.name}
              </Text>
              <Text style={styles.role} testID="shell-profile-role">
                {user.email}
              </Text>
            </View>
          </View>
          {billing.isError ? (
            <View style={styles.paddedSection} testID="shell-profile-billing-error">
              <ErrorState
                description={billing.errorMessage ?? 'Could not load subscription.'}
                onRetry={() => {
                  void billing.refetch();
                }}
                retryLabel="Try again"
                retryTestID="shell-profile-billing-retry"
              />
            </View>
          ) : (
            <View style={styles.paddedSection}>
              <SubscriptionExpiryBanner placement="me" />
              <SubscriptionSummaryCard />
            </View>
          )}
          <Text style={styles.sectionLabel}>App</Text>
          <View style={styles.group}>
            <Pressable
              style={styles.row}
              onPress={() => {
                router.push('/(app)/settings' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              testID="shell-settings-button"
            >
              <Icon icon={Settings} color={theme.colors.textSecondary} size="md" />
              <Text style={styles.rowLabel}>Settings</Text>
              <Icon icon={ChevronRight} color={theme.colors.textFaint} size="md" />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.row}
              onPress={() => {
                router.push('/(app)/plans' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="See plans"
              testID="shell-see-plans-button"
            >
              <Icon icon={Sparkles} color={theme.colors.textSecondary} size="md" />
              <Text style={styles.rowLabel}>See plans</Text>
              <Icon icon={ChevronRight} color={theme.colors.textFaint} size="md" />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.row}
              onPress={() => {
                router.push('/(app)/(tabs)/library' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="Open My Books"
              testID="shell-my-books-button"
            >
              <Icon icon={BookOpen} color={theme.colors.textSecondary} size="md" />
              <Text style={styles.rowLabel}>My Books</Text>
              <Text style={styles.rowMeta} testID="shell-my-books-count">
                {offline.isLoading ? '…' : String(downloadCount)}
              </Text>
              <Icon icon={ChevronRight} color={theme.colors.textFaint} size="md" />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.row}
              onPress={() => {
                router.push('/(app)/about' as Href);
              }}
              accessibilityRole="button"
              accessibilityLabel="About My Hikayat"
              testID="shell-about-button"
            >
              <Icon icon={Info} color={theme.colors.textSecondary} size="md" />
              <Text style={styles.rowLabel}>About My Hikayat</Text>
              <Icon icon={ChevronRight} color={theme.colors.textFaint} size="md" />
            </Pressable>
            <LegalLinkRow kind="privacy" testID="shell-privacy-policy-row" />
          </View>
          <Text style={styles.sectionLabel}>Account</Text>
          <View style={styles.group}>
            <Pressable
              style={styles.row}
              onPress={() => {
                void handleSignOutPress();
              }}
              disabled={isSigningOut}
              testID="shell-sign-out-button"
              accessibilityRole="button"
              accessibilityLabel="Sign out"
              accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
            >
              {isSigningOut ? (
                <ActivityIndicator color={theme.colors.error} />
              ) : (
                <>
                  <Icon icon={LogOut} color={theme.colors.error} size="md" />
                  <Text style={styles.signOutLabel}>Sign out</Text>
                </>
              )}
            </Pressable>
          </View>
          <Text style={styles.versionFooter} testID="shell-profile-version">
            {`My Hikayat · version ${appVersion}`}
          </Text>
        </ScrollView>
      </SafeAreaView>
      <BottomSheet
        isVisible={purgeCopy !== null}
        onDismiss={() => {
          setPurgeCopy(null);
        }}
        accessibilityLabel={purgeCopy?.title}
      >
        {purgeCopy !== null ? (
          <View style={styles.sheetBody}>
            <SheetHeader
              title={purgeCopy.title}
              tone="danger"
              icon={<Text style={styles.sheetIconMark}>!</Text>}
            />
            <Text style={styles.sheetMessage}>{purgeCopy.message}</Text>
            <Button
              label={purgeCopy.confirmLabel}
              onPress={() => {
                void executeSignOut();
              }}
              variant={purgeCopy.confirmVariant}
              isLoading={isSigningOut}
            />
            <Button
              label={purgeCopy.cancelLabel}
              onPress={() => {
                setPurgeCopy(null);
              }}
              variant="secondary"
              isDisabled={isSigningOut}
            />
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

function resolveIdentityInitial(name: string, email: string): string {
  const source: string = name.trim().length > 0 ? name : email;
  if (source.length === 0) {
    return '?';
  }
  return source.charAt(0).toUpperCase();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xxxl,
  },
  loadingBlock: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  paddedSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMark: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    color: theme.colors.textOnBrand,
  },
  identityText: {
    flex: 1,
    minWidth: 0,
    gap: theme.spacing.scale.xs,
  },
  email: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  role: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  sectionLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xs,
  },
  group: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  row: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  rowMeta: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.md,
  },
  signOutLabel: {
    ...theme.typography.body,
    color: theme.colors.error,
    flex: 1,
    fontWeight: theme.typography.weights.semibold,
  },
  versionFooter: {
    ...theme.typography.label,
    color: theme.colors.textFaint,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
  sheetBody: {
    gap: theme.spacing.md,
  },
  sheetMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  sheetIconMark: {
    ...theme.typography.title,
    color: theme.colors.error,
  },
});
