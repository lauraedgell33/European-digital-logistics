import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { authApi } from '@/lib/api';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

export default function EditProfileScreen() {
  const { user, fetchProfile } = useAuthStore();
  const { addNotification } = useAppStore();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: EditProfileFormData) =>
      authApi.updateProfile(data),
    onSuccess: () => {
      fetchProfile();
      addNotification({ type: 'success', title: 'Profile updated successfully' });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    },
  });

  const onSubmit = (data: EditProfileFormData) => {
    updateMutation.mutate(data);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{name.charAt(0).toUpperCase() || 'U'}</Text>
            </View>
            <TouchableOpacity style={styles.changePhotoBtn}>
              <Ionicons name="camera-outline" size={16} color={Colors.primary} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your full name"
                    leftIcon="person-outline"
                    error={errors.name?.message}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                    error={errors.email?.message}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                    error={errors.phone?.message}
                  />
                )}
              />
            </View>
          </Card>

          <Button
            title={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSubmit(onSubmit)}
            disabled={updateMutation.isPending}
            style={styles.saveBtn}
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
  avatarSection: { alignItems: 'center', marginBottom: Spacing.xxl },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold },
  changePhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.xs,
    marginTop: Spacing.md, paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
  },
  changePhotoText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  formCard: { marginBottom: Spacing.lg },
  sectionTitle: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.text,
    marginBottom: Spacing.lg,
  },
  field: { marginBottom: Spacing.lg },
  label: {
    fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  saveBtn: { marginTop: Spacing.md },
});
