import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  password_confirmation: z.string(),
  company_name: z.string().min(2, 'Company name is required'),
  company_type: z.string().min(1, 'Select a company type'),
  vat_number: z.string().min(5, 'VAT number is required'),
  country_code: z.string().min(2, 'Country is required'),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Passwords do not match',
  path: ['password_confirmation'],
});

type RegisterForm = z.infer<typeof registerSchema>;

const companyTypes = [
  { value: 'shipper', label: 'Shipper' },
  { value: 'carrier', label: 'Carrier' },
  { value: 'forwarder', label: 'Forwarder' },
];

const countries = [
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'RO', name: 'Romania' },
  { code: 'PL', name: 'Poland' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'BG', name: 'Bulgaria' },
];

export default function RegisterScreen() {
  const { register, isLoading } = useAuthStore();
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  const { control, handleSubmit, formState: { errors }, trigger } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '', email: '', password: '', password_confirmation: '',
      company_name: '', company_type: 'shipper', vat_number: '', country_code: 'DE',
    },
  });

  const nextStep = async () => {
    const valid = await trigger(['name', 'email', 'password', 'password_confirmation']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
      router.replace('/(tabs)');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed.';
      addNotification({ type: 'error', title: 'Registration Error', message });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => step === 1 ? router.back() : setStep(1)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="cube" size={28} color={Colors.white} />
              </View>
              <Text style={styles.logoText}>LogiMarket</Text>
              <Text style={styles.subtitle}>{t('auth.registerSubtitle', locale)}</Text>
            </View>
            {/* Step indicator */}
            <View style={styles.steps}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
            </View>
          </View>

          {step === 1 ? (
            <View style={styles.form}>
              <Controller control={control} name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.name', locale)} placeholder="John Doe" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.name?.message}
                    icon={<Ionicons name="person-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Controller control={control} name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.email', locale)} placeholder="you@company.com" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.email?.message}
                    keyboardType="email-address" autoCapitalize="none"
                    icon={<Ionicons name="mail-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Controller control={control} name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.password', locale)} placeholder="Min. 8 characters" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.password?.message}
                    secureTextEntry={!showPassword}
                    icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
                    rightIcon={
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textTertiary} />
                      </TouchableOpacity>
                    }
                  />
                )}
              />
              <Controller control={control} name="password_confirmation"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.confirmPassword', locale)} placeholder="••••••••" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.password_confirmation?.message}
                    secureTextEntry
                    icon={<Ionicons name="lock-closed-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Button title={t('common.next', locale)} onPress={nextStep} size="lg" />
            </View>
          ) : (
            <View style={styles.form}>
              <Controller control={control} name="company_name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.companyName', locale)} placeholder="Acme Logistics GmbH" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.company_name?.message}
                    icon={<Ionicons name="business-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Text style={styles.fieldLabel}>{t('auth.companyType', locale)}</Text>
              <Controller control={control} name="company_type"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.typeButtons}>
                    {companyTypes.map((ct) => (
                      <TouchableOpacity
                        key={ct.value}
                        style={[styles.typeBtn, value === ct.value && styles.typeBtnActive]}
                        onPress={() => onChange(ct.value)}
                      >
                        <Text style={[styles.typeBtnText, value === ct.value && styles.typeBtnTextActive]}>
                          {t(`auth.${ct.value}`, locale)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              />
              <Controller control={control} name="vat_number"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label={t('auth.vatNumber', locale)} placeholder="DE123456789" value={value}
                    onChangeText={onChange} onBlur={onBlur} error={errors.vat_number?.message}
                    autoCapitalize="characters"
                    icon={<Ionicons name="document-text-outline" size={20} color={Colors.textTertiary} />}
                  />
                )}
              />
              <Text style={styles.fieldLabel}>{t('auth.country', locale)}</Text>
              <Controller control={control} name="country_code"
                render={({ field: { onChange, value } }) => (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countriesScroll}>
                    <View style={styles.countriesRow}>
                      {countries.map((c) => (
                        <TouchableOpacity
                          key={c.code}
                          style={[styles.countryBtn, value === c.code && styles.countryBtnActive]}
                          onPress={() => onChange(c.code)}
                        >
                          <Text style={[styles.countryCode, value === c.code && styles.countryCodeActive]}>
                            {c.code}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                )}
              />
              <View style={{ height: Spacing.lg }} />
              <Button title={t('auth.register', locale)} onPress={handleSubmit(onSubmit)} loading={isLoading} size="lg" />
            </View>
          )}

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('auth.hasAccount', locale)} </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.footerLink}>{t('auth.login', locale)}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.xl },
  header: { marginBottom: Spacing.xxl },
  backBtn: { marginBottom: Spacing.lg },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.lg },
  logoIcon: {
    width: 56, height: 56, borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.sm,
  },
  logoText: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.xs },
  steps: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border },
  stepDotActive: { backgroundColor: Colors.primary },
  stepLine: { width: 40, height: 2, backgroundColor: Colors.border },
  stepLineActive: { backgroundColor: Colors.primary },
  form: { marginBottom: Spacing.xxl },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold as any, color: Colors.text, marginBottom: Spacing.sm },
  typeButtons: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  typeBtn: {
    flex: 1, paddingVertical: Spacing.md, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.border, alignItems: 'center',
  },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  typeBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  countriesScroll: { marginBottom: Spacing.lg },
  countriesRow: { flexDirection: 'row', gap: Spacing.sm },
  countryBtn: {
    paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1.5, borderColor: Colors.border,
  },
  countryBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryBg },
  countryCode: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  countryCodeActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.lg },
  footerText: { fontSize: FontSize.md, color: Colors.textSecondary },
  footerLink: { fontSize: FontSize.md, color: Colors.primary, fontWeight: FontWeight.semibold },
});
