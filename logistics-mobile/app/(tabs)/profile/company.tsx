import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { companyApi } from '@/lib/api';
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

  const [name, setName] = useState('');
  const [type, setType] = useState('carrier');
  const [taxId, setTaxId] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (company) {
      setName(company.name || '');
      setType(company.type || 'carrier');
      setTaxId(company.tax_id || '');
      setRegistrationNumber(company.registration_number || '');
      setCountry(company.country || '');
      setCity(company.city || '');
      setAddress(company.address || '');
      setPhone(company.phone || '');
      setEmail(company.email || '');
      setWebsite(company.website || '');
      setDescription(company.description || '');
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, string>) => {
      if (!company?.id) throw new Error('No company');
      return companyApi.update(company.id, data);
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

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Company name is required');
      return;
    }
    if (!country.trim()) {
      Alert.alert('Validation', 'Country is required');
      return;
    }
    updateMutation.mutate({
      name: name.trim(),
      type,
      tax_id: taxId.trim(),
      registration_number: registrationNumber.trim(),
      country: country.trim(),
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      website: website.trim(),
      description: description.trim(),
    });
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
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Company name"
                leftIcon="business-outline"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Company Type</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                {COMPANY_TYPES.map((ct) => (
                  <TouchableOpacity
                    key={ct.value}
                    style={[styles.chip, type === ct.value && styles.chipActive]}
                    onPress={() => setType(ct.value)}
                  >
                    <Text style={[styles.chipText, type === ct.value && styles.chipTextActive]}>
                      {ct.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Description</Text>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your company"
                multiline
                numberOfLines={4}
                style={{ minHeight: 100 }}
              />
            </View>
          </Card>

          {/* Legal Info */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Legal Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Tax ID / VAT Number</Text>
              <Input
                value={taxId}
                onChangeText={setTaxId}
                placeholder="e.g., RO12345678"
                leftIcon="document-outline"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Registration Number</Text>
              <Input
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
                placeholder="e.g., J40/1234/2020"
                leftIcon="receipt-outline"
              />
            </View>
          </Card>

          {/* Location */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.row}>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>Country *</Text>
                <Input value={country} onChangeText={setCountry} placeholder="Country" />
              </View>
              <View style={[styles.field, { flex: 1 }]}>
                <Text style={styles.label}>City</Text>
                <Input value={city} onChangeText={setCity} placeholder="City" />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Address</Text>
              <Input
                value={address}
                onChangeText={setAddress}
                placeholder="Full address"
                leftIcon="location-outline"
              />
            </View>
          </Card>

          {/* Contact */}
          <Card style={styles.formCard}>
            <Text style={styles.sectionTitle}>Contact Information</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Phone</Text>
              <Input
                value={phone}
                onChangeText={setPhone}
                placeholder="Company phone"
                keyboardType="phone-pad"
                leftIcon="call-outline"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="Company email"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Website</Text>
              <Input
                value={website}
                onChangeText={setWebsite}
                placeholder="https://example.com"
                autoCapitalize="none"
                leftIcon="globe-outline"
              />
            </View>
          </Card>

          <Button
            title={updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            onPress={handleSave}
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
