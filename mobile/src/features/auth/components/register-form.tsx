import { zodResolver } from '@hookform/resolvers/zod';
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

import { applyAuthFormApiError } from '@/features/auth/lib/apply-auth-form-api-error';
import {
  authCredentialsSchema,
  type AuthCredentials,
} from '@/features/auth/schemas/auth-credentials-schema';
import { useSession } from '@/session/use-session';
import { theme } from '@/theme/theme';

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
  } = useForm<AuthCredentials>({
    resolver: zodResolver(authCredentialsSchema),
    defaultValues: { email: '', password: '' },
  });

  async function executeSignUp(values: AuthCredentials): Promise<void> {
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
    <SafeAreaView style={styles.safe} edges={['top', 'right', 'bottom', 'left']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Text style={styles.title} accessibilityRole="header">
            Create account
          </Text>
          <Text style={styles.body}>Use an email and a password with at least 8 characters.</Text>
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
                placeholder="Password (8+ characters)"
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
          {errors.root?.message !== undefined ? (
            <Text style={styles.error}>{errors.root.message}</Text>
          ) : null}
          <Pressable
            style={[styles.primaryButton, isSubmitting ? styles.buttonDisabled : null]}
            onPress={() => {
              void handleSubmit(executeSignUp)();
            }}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            {isSubmitting ? (
              <ActivityIndicator color={theme.colors.onPrimary} />
            ) : (
              <Text style={styles.primaryButtonLabel}>Create account</Text>
            )}
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={onOpenLogin}
            disabled={isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
          >
            <Text style={styles.secondaryButtonLabel}>I already have an account</Text>
          </Pressable>
          <View style={styles.keyboardSpacer} />
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
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    gap: 14,
    paddingVertical: theme.spacing.lg,
  },
  title: {
    ...theme.typography.title,
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
  keyboardSpacer: {
    height: theme.spacing.xl,
  },
});
