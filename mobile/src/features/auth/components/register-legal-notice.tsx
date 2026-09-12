import { useState, type JSX } from 'react';
import { StyleSheet, Text } from 'react-native';

import { useReaderPlatformSettings } from '@/features/platform-settings/hooks/use-reader-platform-settings';
import { openLegalUrl } from '@/features/platform-settings/lib/open-legal-url';
import { theme } from '@/theme/theme';

/**
 * Informational Terms/Privacy sentence on Sign up. Hidden when neither URL is set. No checkbox.
 */
export function RegisterLegalNotice(): JSX.Element | null {
  const settingsQuery = useReaderPlatformSettings();
  const [isOpening, setIsOpening] = useState<'privacy' | 'terms' | null>(null);
  const privacyPolicyUrl: string | null = settingsQuery.data?.privacyPolicyUrl ?? null;
  const termsOfServiceUrl: string | null = settingsQuery.data?.termsOfServiceUrl ?? null;
  if (settingsQuery.isLoading || (privacyPolicyUrl === null && termsOfServiceUrl === null)) {
    return null;
  }
  return (
    <Text style={styles.copy} testID="auth-register-legal-notice">
      By creating an account you agree to our
      {termsOfServiceUrl !== null ? (
        <>
          {' '}
          <Text
            style={styles.link}
            onPress={() => {
              if (isOpening !== null) {
                return;
              }
              setIsOpening('terms');
              void openLegalUrl(termsOfServiceUrl).finally(() => {
                setIsOpening(null);
              });
            }}
            accessibilityRole="link"
            accessibilityLabel="Terms of Service"
            testID="auth-register-terms-link"
          >
            Terms
          </Text>
        </>
      ) : null}
      {privacyPolicyUrl !== null && termsOfServiceUrl !== null ? ' and ' : null}
      {privacyPolicyUrl !== null && termsOfServiceUrl === null ? ' ' : null}
      {privacyPolicyUrl !== null ? (
        <Text
          style={styles.link}
          onPress={() => {
            if (isOpening !== null) {
              return;
            }
            setIsOpening('privacy');
            void openLegalUrl(privacyPolicyUrl).finally(() => {
              setIsOpening(null);
            });
          }}
          accessibilityRole="link"
          accessibilityLabel="Privacy Policy"
          testID="auth-register-privacy-link"
        >
          Privacy Policy
        </Text>
      ) : null}
      .
    </Text>
  );
}

const styles = StyleSheet.create({
  copy: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  link: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
});
