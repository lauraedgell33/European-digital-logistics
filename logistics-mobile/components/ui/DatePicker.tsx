import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import Modal from './Modal';

interface DatePickerProps {
  /** Currently selected date */
  value: Date;
  /** Called when the user picks a new date */
  onChange: (date: Date) => void;
  /** Picker mode — date-only or date+time */
  mode?: 'date' | 'datetime';
  /** Label displayed above the trigger */
  label?: string;
  /** Earliest selectable date */
  minimumDate?: Date;
  /** Latest selectable date */
  maximumDate?: Date;
  /** Validation error message */
  error?: string;
}

/**
 * Cross-platform date picker.
 * - Android: native DateTimePicker dialog
 * - iOS: spinner picker inside a bottom-sheet Modal
 */
export default function DatePicker({
  value,
  onChange,
  mode = 'date',
  label,
  minimumDate,
  maximumDate,
  error,
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    if (mode === 'datetime') {
      return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  const handleConfirm = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={[styles.trigger, error && styles.triggerError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Date'}: ${formatDate(value)}`}
        accessibilityHint="Double tap to change date"
      >
        <Ionicons name="calendar-outline" size={18} color={Colors.textTertiary} />
        <Text style={styles.triggerText}>{formatDate(value)}</Text>
      </TouchableOpacity>
      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Android: native picker opens as a dialog */}
      {showPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={value}
          mode={mode === 'datetime' ? 'date' : mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}

      {/* iOS: spinner inside a bottom-sheet modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showPicker}
          onClose={handleConfirm}
          title={label || 'Select Date'}
          size="sm"
        >
          <DateTimePicker
            value={value}
            mode={mode}
            display="spinner"
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            style={styles.iosPicker}
          />
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
            accessibilityRole="button"
            accessibilityLabel="Confirm date"
          >
            <Text style={styles.confirmText}>Done</Text>
          </TouchableOpacity>
        </Modal>
      )}
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
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    minHeight: 48,
    gap: Spacing.sm,
  },
  triggerError: { borderColor: Colors.danger },
  triggerText: {
    fontSize: FontSize.md,
    color: Colors.text,
    flex: 1,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.danger,
    marginTop: Spacing.xs,
  },
  iosPicker: {
    height: 200,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  confirmText: {
    color: '#ffffff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
