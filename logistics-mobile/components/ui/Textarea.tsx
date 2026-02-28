import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputContentSizeChangeEventData,
} from 'react-native';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

interface TextareaProps {
  /** Current text value */
  value: string;
  /** Called when text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Label displayed above the textarea */
  label?: string;
  /** Maximum character count */
  maxLength?: number;
  /** Initial visible rows (controls min height) */
  rows?: number;
  /** Validation error message */
  error?: string;
  /** Disable editing */
  disabled?: boolean;
}

/**
 * Multi-line text input with auto-resize, character counter, and error state.
 */
export default function Textarea({
  value,
  onChangeText,
  placeholder,
  label,
  maxLength,
  rows = 4,
  error,
  disabled = false,
}: TextareaProps) {
  const minHeight = rows * 22; // approximate line height
  const [height, setHeight] = useState(minHeight);

  const handleContentSizeChange = useCallback(
    (e: NativeSyntheticEvent<TextInputContentSizeChangeEventData>) => {
      const newHeight = Math.max(minHeight, e.nativeEvent.contentSize.height);
      setHeight(newHeight);
    },
    [minHeight],
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.inputError, disabled && styles.disabled]}>
        <TextInput
          style={[styles.input, { minHeight: height }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={maxLength}
          editable={!disabled}
          onContentSizeChange={handleContentSizeChange}
          textAlignVertical="top"
          accessibilityLabel={label || placeholder}
          accessibilityHint={error ? `Error: ${error}` : undefined}
          accessibilityState={{ disabled }}
        />
      </View>
      <View style={styles.footer}>
        {error ? <Text style={styles.errorText}>{error}</Text> : <View />}
        {maxLength !== undefined && (
          <Text style={styles.charCount}>
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs + 2,
  },
  inputWrapper: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  inputError: { borderColor: Colors.danger },
  disabled: { opacity: 0.5, backgroundColor: Colors.surfaceSecondary },
  input: {
    fontSize: FontSize.md,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
  },
  charCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
  },
});
