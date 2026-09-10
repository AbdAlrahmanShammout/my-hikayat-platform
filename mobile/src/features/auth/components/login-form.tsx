import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenChrome } from '@/features/auth/components/auth-screen-chrome';
import { applyAuthFormApiError } from '@/features/auth/lib/apply-auth-form-api-error';
import {
  authCredentialsSchema,
  type AuthCredentials,
} from '@/features/auth/schemas/auth-credentials-schema';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { TextField } from '@/ui/forms/text-field';
import { Button } from '@/ui/primitives/button';

type LoginFormProps = {
  readonly onOpenRegister: () => void;
  readonly onOpenForgotPassword: () => void;
};

/**
 * Email/password sign-in form. Large targets and plain language for ages 6+.
 */
export function LoginForm({ onOpenRegister, onOpenForgotPassword }: LoginFormProps): JSX.Element {
  const { signIn, clearError } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: { email: '', password: '' },
  });

  async function executeSignIn(values: AuthCredentials): Promise<void> {
    clearError();
    setIsSubmitting(true);
    try {
      await signIn(values);
    } catch (error: unknown) {
      applyAuthFormApiError(error, setError, 'Could not sign in. Check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenChrome
      tagline="Stories for every generation"
      testID="auth-sign-in-screen"
      accessibilityLabel="Sign in screen"
    >
      <Text style={styles.heading}>Welcome back</Text>
      <Text style={styles.body}>Sign in to find books and keep your place.</Text>
      {errors.root?.message !== undefined ? (
        <FormError message={errors.root.message} testID="auth-form-error" />
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
            errorTestID="auth-email-error"
            testID="auth-email-input"
            accessibilityLabel="Email"
          />
        )}
      />
      <View>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="Your password"
              isSecure
              autoComplete="password"
              isDisabled={isSubmitting}
              errorMessage={errors.password?.message}
              errorTestID="auth-password-error"
              testID="auth-password-input"
              accessibilityLabel="Password"
            />
          )}
        />
        <Pressable
          style={styles.forgot}
          onPress={onOpenForgotPassword}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
          testID="auth-forgot-password-link"
        >
          <Text style={styles.forgotLabel}>Forgot password?</Text>
        </Pressable>
      </View>
      <Button
        label="Sign in"
        onPress={() => {
          void handleSubmit(executeSignIn)();
        }}
        isLoading={isSubmitting}
        testID="auth-sign-in-button"
        accessibilityLabel="Sign in"
      />
      <View style={styles.footer}>
        <Text style={styles.footerCopy}>Don't have an account? </Text>
        <Pressable
          onPress={onOpenRegister}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Create an account"
          style={styles.footerAction}
        >
          <Text style={styles.footerActionLabel}>Create one</Text>
        </Pressable>
      </View>
    </AuthScreenChrome>
  );
}

const styles = StyleSheet.create({
  heading: {
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
  forgot: {
    alignSelf: 'flex-end',
    minHeight: 44,
    justifyContent: 'center',
    marginTop: theme.spacing.scale.xs,
  },
  forgotLabel: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.primary,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.scale.xs,
  },
  footerCopy: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  footerAction: {
    minHeight: 44,
    justifyContent: 'center',
  },
  footerActionLabel: {
    ...theme.typography.body,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.primary,
  },
});
