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
import { companyApi } from '@/lib/api';
import { companyProfileSchema, type CompanyProfileFormData } from '@/lib/schemas';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';

const COMPANY_TYPES = [
  { value: 'carrier', label: 'Carrier' },
  { value: 'freight_forwarder', label: 'Freight Forwarder' },
  { value: 'shipper', label: 'Shipper' },
  { value: 'broker', label: 'Broker' },
  { value: 'logistics_provider', label: 'Logistics Provider' },
];

export default function CompanyProfileScreen() {
  const { user, fetchProfile } = useAuthStore();
  const { addNotification } = useAppStore();
  const company = user?.company;

  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<CompanyProfileFormData>({
    resolver: zodResolver(companyProfileSchema),
    defaultValues: {
      name: '',
      type: 'carrier',
      vat_number: '',
      country_code: '',
      city: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (company) {
      reset({
        name: company.name || '',
        type: company.type || 'carrier',
        vat_number: company.tax_id || company.vat_number || '',
        country_code: company.country || company.country_code || '',
        city: company.city || '',
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        description: company.description || '',
      });
    }
  }, [company, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: CompanyProfileFormData) => {
      if (!company?.id) throw new Error('No company');
      return companyApi.update(company.id, data as Record<string, string>);
    },
    onSuccess: () => {
      fetchProfile();
      addNotification({ type: 'success', title: 'Company profile updated' });
      router.back();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update company profile.');
    },
  });

  const onSubmit = (data: CompanyProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (!company) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Profile</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="business-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No Company</Text>
          <Text style={styles.emptySubtitle}>You are not associated with any company yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Company Status */}
          <View style={styles.statusRow}>
            <Badge
              label={company.is_verified ? 'Verified' : 'Unverified'}
              status={company.is_verified ? 'active' : 'pending'}
              size="md"
            />
            <Badge label={company.status || 'active'} status="info" size="md" />
          </View>

          {/* Basic Info */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Basic Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Company Name *</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Company name"
                    leftIcon="business-outline"
                    error={errors.name?.message}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Company Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {COMPANY_TYPES.map((ct) => (
                  <TouchableOpacity
                    key={ct.value}
                    style={[styles.chip, selectedType === ct.value && styles.chipActive]}
                    onPress={() => setValue('type', ct.value)}
                  >
                    <Text style={[styles.chipText, selectedType === ct.value && styles.chipTextActive]}>
                      {ct.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Describe your company"
                    multiline
                    numberOfLines={4}
                    style={{ minHeight: 100 }}
                  />
                )}
              />
            </View>
          </Card>

          {/* Legal Info */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Legal Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Tax ID / VAT Number</Text>
              <Controller
                control={control}
                name="vat_number"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g., RO12345678"
                    leftIcon="document-outline"
                    error={errors.vat_number?.message}
                  />
                )}
              />
            </View>
          </Card>

          {/* Location */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Country *</Text>
                <Controller
                  control={control}
                  name="country_code"
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      placeholder="Country"
                      error={errors.country_code?.message}
                    />
                  )}
                />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, value } }) => (
                    <Input value={value} onChangeText={onChange} placeholder="City" />
                  )}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Address</Text>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Full address"
                    leftIcon="location-outline"
                  />
                )}
              />
            </View>
          </Card>

          {/* Contact */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Company phone"
                    keyboardType="phone-pad"
                    leftIcon="call-outline"
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Company email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    leftIcon="mail-outline"
                    error={errors.email?.message}
                  />
                )}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Website</Text>
              <Controller
                control={control}
                name="website"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="https://example.com"
                    autoCapitalize="none"
                    leftIcon="globe-outline"
                    error={errors.website?.message}
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

          <View style={{ height: Spacing.xxxl }} />
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
  statusRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
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
  row: { flexDirection: 'row', gap: Spacing.md },
  chipScroll: { marginVertical: Spacing.xs },
  chip: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.neutralLight,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.primary, fontWeight: FontWeight.semibold },
  saveBtn: { marginTop: Spacing.md },
  emptyContainer: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.xxl,
  },
  emptyTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: Colors.text, marginTop: Spacing.md },
  emptySubtitle: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
});
