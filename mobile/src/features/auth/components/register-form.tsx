import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthScreenChrome } from '@/features/auth/components/auth-screen-chrome';
import { RegisterLegalNotice } from '@/features/auth/components/register-legal-notice';
import { applyAuthFormApiError } from '@/features/auth/lib/apply-auth-form-api-error';
import {
  registerCredentialsSchema,
  type RegisterCredentials,
} from '@/features/auth/schemas/register-credentials-schema';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';
import { FormError } from '@/ui/forms/form-error';
import { TextField } from '@/ui/forms/text-field';
import { Button } from '@/ui/primitives/button';

type RegisterFormProps = {
  readonly onOpenLogin: () => void;
};

/**
 * Creates a reader account. Password length UX mirrors backend 8–72 rule.
 */
export function RegisterForm({ onOpenLogin }: RegisterFormProps): JSX.Element {
  const { signUp, clearError } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerCredentialsSchema),
    defaultValues: { displayName: '', email: '', password: '' },
  });

  async function executeSignUp(values: RegisterCredentials): Promise<void> {
    clearError();
    setIsSubmitting(true);
    try {
      await signUp(values);
    } catch (error: unknown) {
      applyAuthFormApiError(error, setError, 'Could not create your account.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthScreenChrome tagline="Start reading in minutes">
      <Text style={styles.heading}>Create your account</Text>
      <Text style={styles.body}>Use your name, an email, and a password with at least 8 characters.</Text>
      {errors.root?.message !== undefined ? <FormError message={errors.root.message} /> : null}
      <Controller
        control={control}
        name="displayName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Display name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="The name we should greet you with"
            autoCapitalize="words"
            autoCorrect={false}
            autoComplete="name"
            isDisabled={isSubmitting}
            errorMessage={errors.displayName?.message}
            accessibilityLabel="Display name"
            testID="auth-register-display-name"
          />
        )}
      />
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
            accessibilityLabel="Email"
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            placeholder="At least 8 characters"
            hint="8–72 characters"
            isSecure
            autoComplete="password"
            isDisabled={isSubmitting}
            errorMessage={errors.password?.message}
            accessibilityLabel="Password"
          />
        )}
      />
      <Button
        label="Create account"
        onPress={() => {
          void handleSubmit(executeSignUp)();
        }}
        isLoading={isSubmitting}
        accessibilityLabel="Create account"
      />
      <RegisterLegalNotice />
      <View style={styles.footer}>
        <Text style={styles.footerCopy}>Already have an account? </Text>
        <Pressable
          onPress={onOpenLogin}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in"
          style={styles.footerAction}
        >
          <Text style={styles.footerActionLabel}>Sign in</Text>
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
