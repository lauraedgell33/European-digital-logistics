import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, Spacing, Shadow } from '@/constants/theme';

interface SearchBarProps {
  /** Current search value */
  value: string;
  /** Called with the debounced search text */
  onChangeText: (text: string) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Called when the clear button is pressed */
  onClear?: () => void;
  /** Automatically focus the input on mount */
  autoFocus?: boolean;
}

/**
 * Search input with debounced onChange, search icon, and clear button.
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  debounceMs = 300,
  onClear,
  autoFocus = false,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalValue(text);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onChangeText(text);
      }, debounceMs);
    },
    [onChangeText, debounceMs],
  );

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <View style={styles.container} accessibilityRole="search">
      <Ionicons name="search" size={18} color={Colors.textTertiary} style={styles.icon} />
      <TextInput
        style={styles.input}
        value={localValue}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCorrect={false}
        accessibilityLabel={placeholder}
        accessibilityHint="Type to search"
      />
      {localValue.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          style={styles.clearBtn}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 44,
    ...Shadow.sm,
  },
  icon: { marginRight: Spacing.sm },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm + 2,
  },
  clearBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
