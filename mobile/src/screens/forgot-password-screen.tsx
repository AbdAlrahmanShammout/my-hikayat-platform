import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
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

import { requestPasswordReset } from '@/features/auth/api/request-password-reset';
import { applyAuthFormApiError } from '@/features/auth/lib/apply-auth-form-api-error';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas/forgot-password-schema';
import { theme } from '@/theme/theme';

/**
 * Requests a password-reset email. Always shows the enumeration-safe acknowledgement.
 */
export function ForgotPasswordScreen(): JSX.Element {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [ackMessage, setAckMessage] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  async function executeRequest(values: ForgotPasswordFormValues): Promise<void> {
    setAckMessage(null);
    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset({ email: values.email.trim().toLowerCase() });
      setAckMessage(response.message);
    } catch (error: unknown) {
      applyAuthFormApiError(error, setError, 'Could not send reset instructions. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'right', 'bottom', 'left']}
      testID="auth-forgot-password-screen"
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
            testID="auth-forgot-back"
          >
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
          <Text style={styles.title} accessibilityRole="header">
            Forgot password
          </Text>
          <Text style={styles.body}>
            Enter your email. If an account exists, we will send reset instructions.
          </Text>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor={theme.colors.textPlaceholder}
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                editable={!isSubmitting}
                testID="auth-forgot-email-input"
                accessibilityLabel="Email"
              />
            )}
          />
          {errors.email?.message !== undefined ? (
            <Text style={styles.error}>{errors.email.message}</Text>
          ) : null}
          {errors.root?.message !== undefined ? (
            <Text style={styles.error} testID="auth-forgot-error">
              {errors.root.message}
            </Text>
          ) : null}
          {ackMessage !== null ? (
            <Text style={styles.success} testID="auth-forgot-ack">
              {ackMessage}
            </Text>
          ) : null}
          <Pressable
            style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            onPress={() => {
              void handleSubmit(executeRequest)();
            }}
            disabled={isSubmitting}
            testID="auth-forgot-submit"
            accessibilityRole="button"
            accessibilityLabel="Send reset instructions"
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.primaryLabel}>Send reset instructions</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              router.push('/(public)/reset-password' as Href);
            }}
            accessibilityRole="button"
            accessibilityLabel="I already have a reset token"
            testID="auth-forgot-have-token"
          >
            <Text style={styles.secondaryLabel}>I already have a reset token</Text>
          </Pressable>
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
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});
