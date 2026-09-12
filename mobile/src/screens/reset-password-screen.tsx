import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetPassword } from '@/features/auth/api/reset-password';
import { applyAuthFormApiError } from '@/features/auth/lib/apply-auth-form-api-error';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas/reset-password-schema';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { TextField } from '@/ui/forms/text-field';
import { BackHeader } from '@/ui/primitives/back-header';
import { Button } from '@/ui/primitives/button';

function readTokenParam(value: string | string[] | undefined): string {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value) && typeof value[0] === 'string') {
    return value[0];
  }
  return '';
}

/**
 * Sets a new password from an emailed recovery token (deep link or paste).
 */
export function ResetPasswordScreen(): JSX.Element {
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: readTokenParam(params.token),
      password: '',
    },
  });
  const isLocked: boolean = isSubmitting || successMessage !== null;

  async function executeReset(values: ResetPasswordFormValues): Promise<void> {
    setSuccessMessage(null);
    setIsSubmitting(true);
    try {
      const response = await resetPassword({
        token: values.token.trim(),
        password: values.password,
      });
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      applyAuthFormApiError(
        error,
        setError,
        'Could not reset the password. The link may be expired or already used.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function navigateBackToSignIn(): void {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(public)/sign-in');
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'right', 'bottom', 'left']}
      testID="auth-reset-password-screen"
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <BackHeader title="" onPressBack={navigateBackToSignIn} backTestID="auth-reset-back" />
          <Text style={styles.title} accessibilityRole="header">
            Choose a new password
          </Text>
          <Text style={styles.body}>
            Paste the reset token from your email if it is not already filled in.
          </Text>
          {errors.root?.message !== undefined ? (
            <FormError message={errors.root.message} testID="auth-reset-error" />
          ) : null}
          {successMessage !== null ? (
            <View style={styles.sentCard} testID="auth-reset-success-card">
              <Text style={styles.success} testID="auth-reset-success">
                {successMessage}
              </Text>
            </View>
          ) : null}
          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Reset token"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Reset token"
                autoCapitalize="none"
                autoCorrect={false}
                isDisabled={isLocked}
                isMultiline
                numberOfLines={4}
                errorMessage={errors.token?.message}
                testID="auth-reset-token-input"
                accessibilityLabel="Reset token"
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="New password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="New password"
                isSecure
                isDisabled={isLocked}
                errorMessage={errors.password?.message}
                testID="auth-reset-password-input"
                accessibilityLabel="New password"
              />
            )}
          />
          {successMessage === null ? (
            <Button
              label="Save new password"
              onPress={() => {
                void handleSubmit(executeReset)();
              }}
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
              testID="auth-reset-submit"
              accessibilityLabel="Save new password"
            />
          ) : (
            <Button
              label="Back to sign in"
              onPress={() => {
                router.replace('/(public)/sign-in');
              }}
              testID="auth-reset-go-sign-in"
              accessibilityLabel="Back to sign in"
            />
          )}
          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  title: {
    ...theme.typography.title,
    fontSize: theme.typography.scale['2xl'],
    fontStyle: 'italic',
    fontWeight: theme.typography.weights.regular,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  sentCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    padding: theme.spacing.cardInner,
    gap: theme.spacing.sm,
  },
  success: {
    ...theme.typography.body,
    color: theme.colors.success,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});
