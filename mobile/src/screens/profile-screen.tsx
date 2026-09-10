import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useState, type JSX } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { SubscriptionExpiryBanner } from '@/features/billing/components/subscription-expiry-banner';
import { SubscriptionStatusCard } from '@/features/billing/components/subscription-status-card';
import {
  buildOfflinePurgeConfirmCopy,
  shouldRequireOfflinePurgeConfirmation,
  type OfflinePurgeConfirmCopy,
} from '@/features/offline/lib/confirm-offline-purge-if-needed';
import { listOfflineManifests } from '@/features/offline/lib/offline-manifest-storage';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { BottomSheet } from '@/ui/layout/bottom-sheet';
import { Button } from '@/ui/primitives/button';

/**
 * Profile tab: identity from /auth/me, expiry awareness, subscription status, settings, sign-out.
 */
export function ProfileScreen(): JSX.Element {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useSession();
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
    if (!shouldRequireOfflinePurgeConfirmation(packages.length)) {
      await executeSignOut();
      return;
    }
    setPurgeCopy(
      buildOfflinePurgeConfirmCopy({
        kind: 'sign_out',
        packageCount: packages.length,
      }),
    );
  }

  const email: string = user?.email ?? '—';
  const initial: string = resolveEmailInitial(user?.email);

  return (
    <View style={styles.root} testID="shell-profile-screen">
      {isScreenFocused ? <StatusBar style="light" /> : null}
      <View style={[styles.header, { paddingTop: insets.top + theme.spacing.xs }]}>
        <Text style={styles.title} accessibilityRole="header" testID="shell-profile-title">
          Me
        </Text>
      </View>
      <SafeAreaView style={styles.body} edges={['left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.identity}>
            <View style={styles.avatar} accessibilityElementsHidden>
              <Text style={styles.avatarMark}>{initial}</Text>
            </View>
            <View style={styles.identityText}>
              <Text style={styles.email} testID="shell-profile-email">
                {email}
              </Text>
              <Text style={styles.role} testID="shell-profile-role">
                {user?.role ?? '—'}
              </Text>
            </View>
          </View>
          <View style={styles.paddedSection}>
            <SubscriptionExpiryBanner placement="me" />
            <SubscriptionStatusCard />
          </View>
          <Text style={styles.sectionLabel}>Account</Text>
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
              <Text style={styles.rowLabel}>Settings</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
            <View style={styles.divider} />
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
                <Text style={styles.signOutLabel}>Sign out</Text>
              )}
            </Pressable>
          </View>
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
            <View style={styles.sheetIcon} accessibilityElementsHidden>
              <Text style={styles.sheetIconMark}>!</Text>
            </View>
            <Text style={styles.sheetTitle}>{purgeCopy.title}</Text>
            <Text style={styles.sheetMessage}>{purgeCopy.message}</Text>
            <Button
              label={purgeCopy.confirmLabel}
              onPress={() => {
                void executeSignOut();
              }}
              variant="destructive"
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

function resolveEmailInitial(email: string | undefined): string {
  const trimmed: string = email?.trim() ?? '';
  if (trimmed.length === 0) {
    return '?';
  }
  return trimmed.charAt(0).toUpperCase();
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    backgroundColor: theme.colors.navBg,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.title,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textOnBrand,
  },
  body: {
    flex: 1,
  },
  content: {
    paddingBottom: theme.spacing.xxxl,
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
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xs,
  },
  group: {
    marginHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    overflow: 'hidden',
  },
  row: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  rowLabel: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  chevron: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    color: theme.colors.textFaint,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderSubtle,
    marginHorizontal: theme.spacing.md,
  },
  signOutLabel: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  sheetBody: {
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
  },
  sheetIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.errorBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetIconMark: {
    ...theme.typography.title,
    color: theme.colors.error,
  },
  sheetTitle: {
    ...theme.typography.title,
    fontSize: theme.typography.scale.xl,
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  sheetMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
});
