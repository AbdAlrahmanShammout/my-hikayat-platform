import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type JSX } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  authCredentialsSchema,
  type AuthCredentials,
} from '@/features/auth/schemas/auth-credentials-schema';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

type LoginFormProps = {
  readonly onOpenRegister: () => void;
};

/**
 * Email/password sign-in form. Large targets and plain language for ages 6+.
 */
export function LoginForm({ onOpenRegister }: LoginFormProps): JSX.Element {
  const { signIn, errorMessage, clearError } = useSession();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const {
    control,
    handleSubmit,
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
    } catch {
      // Error message is owned by SessionProvider.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">
        Reader
      </Text>
      <Text style={styles.body}>Sign in to find books and keep your place.</Text>
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
            accessibilityLabel="Email"
          />
        )}
      />
      {errors.email?.message !== undefined ? (
        <Text style={styles.error}>{errors.email.message}</Text>
      ) : null}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder="Password"
            placeholderTextColor={theme.colors.textPlaceholder}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            editable={!isSubmitting}
            accessibilityLabel="Password"
          />
        )}
      />
      {errors.password?.message !== undefined ? (
        <Text style={styles.error}>{errors.password.message}</Text>
      ) : null}
      {errorMessage !== null ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <Pressable
        style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
        onPress={() => {
          void handleSubmit(executeSignIn)();
        }}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Sign in"
      >
        {isSubmitting ? (
          <ActivityIndicator color={theme.colors.onPrimary} />
        ) : (
          <Text style={styles.primaryButtonLabel}>Sign in</Text>
        )}
      </Pressable>
      <Pressable
        style={styles.secondaryButton}
        onPress={onOpenRegister}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="Create an account"
      >
        <Text style={styles.secondaryButtonLabel}>Create an account</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    gap: 14,
  },
  title: {
    ...theme.typography.titleLg,
    color: theme.colors.textPrimary,
  },
  body: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
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
    fontSize: 16,
    color: theme.colors.danger,
  },
  primaryButton: {
    minHeight: theme.controlMinHeight,
    borderRadius: theme.radii.control,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonLabel: {
    ...theme.typography.button,
    color: theme.colors.onPrimary,
  },
  secondaryButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonLabel: {
    ...theme.typography.link,
    color: theme.colors.primaryMuted,
  },
});
