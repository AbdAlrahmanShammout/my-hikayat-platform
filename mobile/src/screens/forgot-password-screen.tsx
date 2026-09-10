import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { FormError } from '@/ui/forms/form-error';
import { TextField } from '@/ui/forms/text-field';
import { BackHeader } from '@/ui/primitives/back-header';
import { Button } from '@/ui/primitives/button';

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

  function navigateBackToSignIn(): void {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/(public)/sign-in');
  }

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
          <BackHeader title="" onPressBack={navigateBackToSignIn} backTestID="auth-forgot-back" />
          <Text style={styles.title} accessibilityRole="header">
            Forgot password?
          </Text>
          <Text style={styles.body}>
            Enter your email. If an account exists, we will send reset instructions.
          </Text>
          {errors.root?.message !== undefined ? (
            <FormError message={errors.root.message} testID="auth-forgot-error" />
          ) : null}
          {ackMessage !== null ? (
            <View style={styles.ackBanner}>
              <Text style={styles.success} testID="auth-forgot-ack">
                {ackMessage}
              </Text>
            </View>
          ) : null}
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                label="Email address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="your@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                isDisabled={isSubmitting}
                errorMessage={errors.email?.message}
                testID="auth-forgot-email-input"
                accessibilityLabel="Email"
              />
            )}
          />
          <Button
            label="Send reset instructions"
            onPress={() => {
              void handleSubmit(executeRequest)();
            }}
            isLoading={isSubmitting}
            testID="auth-forgot-submit"
            accessibilityLabel="Send reset instructions"
          />
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
  ackBanner: {
    backgroundColor: theme.colors.successBg,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  success: {
    ...theme.typography.body,
    color: theme.colors.success,
  },
  secondaryButton: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryLabel: {
    ...theme.typography.link,
    color: theme.colors.primary,
  },
  spacer: {
    height: theme.spacing.xl,
  },
});
