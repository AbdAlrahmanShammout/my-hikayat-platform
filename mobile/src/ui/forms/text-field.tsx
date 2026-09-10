import { useState, type JSX, type ReactNode } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from 'react-native';

import { theme } from '@/theme/theme';

type TextFieldProps = {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (value: string) => void;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly errorMessage?: string;
  readonly errorTestID?: string;
  readonly isDisabled?: boolean;
  readonly isSecure?: boolean;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
  readonly keyboardType?: KeyboardTypeOptions;
  readonly autoCapitalize?: TextInputProps['autoCapitalize'];
  readonly autoComplete?: TextInputProps['autoComplete'];
  readonly autoCorrect?: boolean;
  readonly onBlur?: () => void;
  readonly onSubmitEditing?: TextInputProps['onSubmitEditing'];
  readonly returnKeyType?: TextInputProps['returnKeyType'];
  readonly isLabelHidden?: boolean;
  readonly testID?: string;
  readonly accessibilityLabel?: string;
};

/**
 * Labeled text input with focus and error chrome. Validation stays in the parent form.
 */
export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  errorMessage,
  errorTestID,
  isDisabled = false,
  isSecure = false,
  leading,
  trailing,
  keyboardType,
  autoCapitalize,
  autoComplete,
  autoCorrect,
  onBlur,
  onSubmitEditing,
  returnKeyType,
  isLabelHidden = false,
  testID,
  accessibilityLabel,
}: TextFieldProps): JSX.Element {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const hasError = errorMessage !== undefined && errorMessage !== '';
  const borderColor = resolveBorderColor(hasError, isFocused);
  return (
    <View style={styles.wrap}>
      {isLabelHidden ? null : <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.field,
          { borderColor },
          isFocused && !hasError ? styles.focusRing : null,
          hasError && isFocused ? styles.errorRing : null,
          isDisabled ? styles.disabled : null,
        ]}
      >
        {leading}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textPlaceholder}
          editable={!isDisabled}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          testID={testID}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityState={{ disabled: isDisabled }}
          onFocus={() => {
            setIsFocused(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          style={styles.input}
        />
        {trailing}
      </View>
      {hasError ? (
        <Text style={styles.error} testID={errorTestID}>
          {errorMessage}
        </Text>
      ) : null}
      {!hasError && hint !== undefined ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function resolveBorderColor(hasError: boolean, isFocused: boolean): string {
  if (hasError) {
    return theme.colors.error;
  }
  if (isFocused) {
    return theme.colors.borderFocus;
  }
  return theme.colors.borderDefault;
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.scale.xs,
  },
  label: {
    ...theme.typography.label,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textMuted,
  },
  field: {
    minHeight: theme.controlMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderRadius: theme.radii.md,
  },
  focusRing: {
    borderWidth: theme.shadows.focus.spread,
  },
  errorRing: {
    borderWidth: theme.shadows.focus.spread,
  },
  disabled: {
    backgroundColor: theme.colors.canvasWarm,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.sm,
  },
  error: {
    ...theme.typography.body,
    color: theme.colors.error,
  },
  hint: {
    ...theme.typography.label,
    color: theme.colors.textMuted,
  },
});
