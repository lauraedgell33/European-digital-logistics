import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const schema = z.object({ email: z.string().email('Invalid email address') });
type ForgotForm = z.infer<typeof schema>;

export default function ForgotPasswordScreen() {
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSent(true);
      addNotification({ type: 'success', title: 'Success', message: t('auth.emailSent', locale) });
    } catch (error: any) {
      addNotification({ type: 'error', title: 'Error', message: error.response?.data?.message || 'Request failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={48} color={Colors.primary} />
          </View>

          <Text style={styles.title}>{t('auth.resetPassword', locale)}</Text>
          <Text style={styles.description}>{t('auth.resetInstructions', locale)}</Text>

          {sent ? (
            <View style={styles.sentContainer}>
              <View style={styles.sentIcon}>
                <Ionicons name="checkmark-circle" size={64} color={Colors.success} />
              </View>
              <Text style={styles.sentText}>{t('auth.emailSent', locale)}</Text>
              <Button title={t('auth.login', locale)} onPress={() => router.replace('/(auth)/login')} style={{ marginTop: Spacing.xl }} />
            </View>
          ) : (
            <View style={styles.form}>
              <Controller control={control} name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.email', locale)} placeholder="you@company.com"
                    value={value} onChangeText={onChange} onBlur={onBlur}
                    error={errors.email?.message} keyboardType="email-address" autoCapitalize="none"
                    icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Button title={t('auth.resetPassword', locale)} onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.xl },
  backBtn: { marginBottom: Spacing.xxl },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primaryBg,
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: Spacing.xl,
  },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.text, textAlign: 'center' },
  description: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xxxl },
  form: {},
  sentContainer: { alignItems: 'center', marginTop: Spacing.xxl },
  sentIcon: { marginBottom: Spacing.lg },
  sentText: { fontSize: FontSize.lg, fontWeight: FontWeight.medium, color: Colors.text, textAlign: 'center' },
});
