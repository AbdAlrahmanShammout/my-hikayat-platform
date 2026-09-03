import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
          <Pressable
            style={styles.backButton}
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/(public)/sign-in');
            }}
            accessibilityRole="button"
            accessibilityLabel="Back"
            testID="auth-reset-back"
          >
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            Choose a new password
          </Text>
          <Text style={styles.body}>
            Paste the reset token from your email if it is not already filled in.
          </Text>
          <Controller
            control={control}
            name="token"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={[styles.input, styles.tokenInput]}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Reset token"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                editable={!isSubmitting && successMessage === null}
                multiline
                testID="auth-reset-token-input"
                accessibilityLabel="Reset token"
              />
            )}
          />
          {errors.token?.message !== undefined ? (
            <Text style={styles.error}>{errors.token.message}</Text>
          ) : null}
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="New password"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                editable={!isSubmitting && successMessage === null}
                testID="auth-reset-password-input"
                accessibilityLabel="New password"
              />
            )}
          />
          {errors.password?.message !== undefined ? (
            <Text style={styles.error}>{errors.password.message}</Text>
          ) : null}
          {errors.root?.message !== undefined ? (
            <Text style={styles.error} testID="auth-reset-error">
              {errors.root.message}
            </Text>
          ) : null}
          {successMessage !== null ? (
            <Text style={styles.success} testID="auth-reset-success">
              {successMessage}
            </Text>
          ) : null}
          {successMessage === null ? (
            <Pressable
              style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
              onPress={() => {
                void handleSubmit(executeReset)();
              }}
              disabled={isSubmitting}
              testID="auth-reset-submit"
              accessibilityRole="button"
              accessibilityLabel="Save new password"
            >
              {isSubmitting ? (
                <ActivityIndicator color={theme.colors.onPrimary} />
              ) : (
                <Text style={styles.primaryLabel}>Save new password</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                router.replace('/(public)/sign-in');
              }}
              accessibilityRole="button"
              accessibilityLabel="Back to sign in"
              testID="auth-reset-go-sign-in"
            >
              <Text style={styles.primaryLabel}>Back to sign in</Text>
            </Pressable>
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
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
    justifyContent: 'center',
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
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    minHeight: theme.controlMinHeight,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.control,
    paddingHorizontal: theme.spacing.md,
    fontSize: 18,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  tokenInput: {
    minHeight: 96,
    paddingVertical: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
  },
  success: {
    ...theme.typography.body,
    color: theme.colors.primaryMuted,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});
