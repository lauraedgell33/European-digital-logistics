import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import Modal from './Modal';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Currently selected value */
  value?: string;
  /** Called when the user picks an option */
  onChange: (value: string) => void;
  /** Placeholder text when nothing is selected */
  placeholder?: string;
  /** Label shown above the trigger */
  label?: string;
  /** Enable search filtering within the option list */
  searchable?: boolean;
  /** Validation error message */
  error?: string;
}

/**
 * Picker / Selector component.
 * Opens a bottom-sheet Modal with a searchable list of options.
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  label,
  searchable = false,
  error,
}: SelectProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  }, [options, search]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setVisible(false);
    setSearch('');
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={label ? `${label}: ${selectedOption?.label || placeholder}` : selectedOption?.label || placeholder}
        accessibilityHint="Double tap to open selection"
      >
        <Text style={[styles.triggerText, !selectedOption && styles.placeholderText]}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={visible}
        onClose={() => { setVisible(false); setSearch(''); }}
        title={label || 'Select'}
        size="lg"
      >
        {searchable && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={Colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoFocus
              accessibilityLabel="Search options"
            />
          </View>
        )}
        <FlatList
          data={filteredOptions}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.option, item.value === value && styles.optionSelected]}
              onPress={() => handleSelect(item.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: item.value === value }}
              accessibilityLabel={item.label}
            >
              <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>
                {item.label}
              </Text>
              {item.value === value && (
                <Ionicons name="checkmark" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No options found</Text>
          }
        />
      </Modal>
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
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 48,
  },
  triggerError: { borderColor: Colors.danger },
  triggerText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  placeholderText: { color: Colors.textTertiary },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: Colors.primaryBg,
    borderRadius: BorderRadius.sm,
  },
  optionText: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: FontWeight.semibold,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: FontSize.md,
    paddingVertical: Spacing.xl,
  },
});
