import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { changePasswordSchema, type ChangePasswordFormData } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing } from '@/constants/theme';

export default function ChangePasswordScreen() {
  const { addNotification } = useAppStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirmation: '',
    },
  });

  const changeMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      authApi.changePassword(data),
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Password changed successfully' });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to change password. Please check your current password.');
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changeMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Change Password</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.formCard}>
            <View style={styles.infoBox}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors.info} />
              <Text style={styles.infoText}>
                Choose a strong password with at least 8 characters, including uppercase, lowercase, numbers, and symbols.
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Current Password</Text>
              <View style={styles.passwordRow}>
                <Controller
                  control={control}
                  name="current_password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter current password"
                      secureTextEntry={!showCurrent}
                      leftIcon="lock-closed-outline"
                      error={errors.current_password?.message}
                      style={{ flex: 1 }}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                  <Ionicons name={showCurrent ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <Controller
                  control={control}
                  name="new_password"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Enter new password"
                      secureTextEntry={!showNew}
                      leftIcon="key-outline"
                      error={errors.new_password?.message}
                      style={{ flex: 1 }}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                  <Ionicons name={showNew ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm New Password</Text>
              <View style={styles.passwordRow}>
                <Controller
                  control={control}
                  name="new_password_confirmation"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Re-enter new password"
                      secureTextEntry={!showConfirm}
                      leftIcon="key-outline"
                      error={errors.new_password_confirmation?.message}
                      style={{ flex: 1 }}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          <Button
            title={changeMutation.isPending ? 'Changing...' : 'Change Password'}
            onPress={handleSubmit(onSubmit)}
            disabled={changeMutation.isPending}
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    backgroundColor: Colors.surface,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text },
  content: { padding: Spacing.xxl },
  formCard: { marginBottom: Spacing.lg },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    backgroundColor: Colors.infoBg, padding: Spacing.md, borderRadius: 8, marginBottom: Spacing.xxl,
  },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.info, lineHeight: 20 },
  field: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { padding: Spacing.sm, marginLeft: -Spacing.xxl },
  errorText: { fontSize: FontSize.xs, color: Colors.danger, marginTop: Spacing.xs },
  submitBtn: { marginTop: Spacing.md },
});
