import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight, Shadow } from '@/constants/theme';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

/**
 * Bottom sheet modal component.
 * Slides up from the bottom with a drag handle and optional title header.
 * Tap outside (on overlay) to dismiss.
 */
export default function Modal({ visible, onClose, title, children, size = 'md' }: ModalProps) {
  const height = { sm: '30%', md: '50%', lg: '75%', full: '92%' }[size];

  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { maxHeight: height }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          {title && (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Close modal">
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.content}>{children}</View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, ...Shadow.lg },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  closeBtn: { fontSize: FontSize.lg, color: Colors.textTertiary, padding: Spacing.xs },
  content: { padding: Spacing.xl, flex: 1 },
});
