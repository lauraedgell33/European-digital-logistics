import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, icon, leftIcon, rightIcon, containerStyle, style, ...props }, ref) => {
    const leftElement = icon || (leftIcon ? <Ionicons name={leftIcon} size={18} color={Colors.textTertiary} /> : null);
    return (
      <View style={[styles.container, containerStyle]}>
        {label ? <Text style={styles.label}>{label}</Text> : null}
        <View style={[styles.inputWrapper, error && styles.inputError]}>
          {leftElement && <View style={styles.iconLeft}>{leftElement}</View>}
          <TextInput
            ref={ref}
            style={[styles.input, leftElement ? styles.inputWithIcon : undefined, rightIcon ? styles.inputWithRightIcon : undefined, style]}
            placeholderTextColor={Colors.textTertiary}
            accessibilityLabel={label || props.placeholder}
            accessibilityHint={error ? `Error: ${error}` : undefined}
            {...props}
          />
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';
export default Input;

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs + 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  inputError: { borderColor: Colors.danger },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 48,
  },
  inputWithIcon: { paddingLeft: Spacing.xs },
  inputWithRightIcon: { paddingRight: Spacing.xs },
  iconLeft: { paddingLeft: Spacing.md },
  iconRight: { paddingRight: Spacing.md },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
});
