import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/constants/theme';
import Modal from './Modal';

interface ActionSheetAction {
  /** Display label */
  label: string;
  /** Optional Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Handler called when the action is pressed */
  onPress: () => void;
  /** Mark this action as destructive (renders in red) */
  destructive?: boolean;
}

interface ActionSheetProps {
  /** Whether the action sheet is visible */
  visible: boolean;
  /** Close handler */
  onClose: () => void;
  /** List of available actions */
  actions: ActionSheetAction[];
  /** Optional title above the action list */
  title?: string;
}

/**
 * Bottom action sheet with a list of tappable actions.
 * Uses the shared Modal component for presentation.
 * Destructive actions are highlighted in the danger color.
 */
export default function ActionSheet({ visible, onClose, actions, title }: ActionSheetProps) {
  const handleAction = (action: ActionSheetAction) => {
    action.onPress();
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title} size="sm">
      <View style={styles.actions}>
        {actions.map((action, index) => {
          const textColor = action.destructive ? Colors.danger : Colors.text;
          const iconColor = action.destructive ? Colors.danger : Colors.textSecondary;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.action, index < actions.length - 1 && styles.actionBorder]}
              onPress={() => handleAction(action)}
              activeOpacity={0.6}
              accessibilityRole="button"
              accessibilityLabel={action.label}
            >
              {action.icon && (
                <View style={[styles.actionIcon, action.destructive && styles.actionIconDestructive]}>
                  <Ionicons name={action.icon} size={20} color={iconColor} />
                </View>
              )}
              <Text style={[styles.actionText, { color: textColor }]}>{action.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Cancel button */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={onClose}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Cancel"
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginBottom: Spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md + 2,
    gap: Spacing.md,
  },
  actionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconDestructive: {
    backgroundColor: Colors.dangerLight,
  },
  actionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  cancelBtn: {
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
});
