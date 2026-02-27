import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { freightApi } from '@/lib/api';
import { useAppStore } from '@/stores/appStore';
import { t } from '@/lib/i18n';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '@/constants/theme';
import { format } from 'date-fns';

const schema = z.object({
  origin_city: z.string().min(2),
  origin_country: z.string().min(2),
  destination_city: z.string().min(2),
  destination_country: z.string().min(2),
  cargo_type: z.string().min(2),
  weight: z.string().min(1),
  volume: z.string().optional(),
  loading_date: z.string().min(1),
  price: z.string().min(1),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const EU_COUNTRIES = ['DE', 'FR', 'IT', 'ES', 'RO', 'PL', 'NL', 'BE', 'AT', 'CZ', 'HU', 'BG'];
const CARGO_TYPES = ['General', 'Palletized', 'Bulk', 'Liquid', 'Refrigerated', 'Hazardous', 'Oversized', 'Fragile'];

export default function CreateFreightScreen() {
  const locale = useAppStore((s) => s.locale);
  const addNotification = useAppStore((s) => s.addNotification);
  const queryClient = useQueryClient();

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      origin_country: 'DE',
      destination_country: 'FR',
      loading_date: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const originCountry = watch('origin_country');
  const destCountry = watch('destination_country');

  const createMutation = useMutation({
    mutationFn: (data: FormData) => freightApi.create({
      ...data,
      weight: parseFloat(data.weight),
      volume: data.volume ? parseFloat(data.volume) : undefined,
      price: parseFloat(data.price),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freight'] });
      addNotification({ type: 'success', title: t('freight.createSuccess', locale) });
      router.back();
    },
    onError: () => addNotification({ type: 'error', title: t('common.error', locale) }),
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('freight.create', locale)}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Route */}
          <Card title={t('freight.origin', locale)} style={styles.card}>
            <Controller control={control} name="origin_city" render={({ field }) => (
              <Input label={t('orders.city', locale)} placeholder="Berlin" value={field.value} onChangeText={field.onChange} error={errors.origin_city?.message} />
            )} />
            <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {EU_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => setValue('origin_country', c)} style={[styles.pill, originCountry === c && styles.pillActive]}>
                  <Text style={[styles.pillText, originCountry === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          <Card title={t('freight.destination', locale)} style={styles.card}>
            <Controller control={control} name="destination_city" render={({ field }) => (
              <Input label={t('orders.city', locale)} placeholder="Paris" value={field.value} onChangeText={field.onChange} error={errors.destination_city?.message} />
            )} />
            <Text style={styles.fieldLabel}>{t('orders.country', locale)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
              {EU_COUNTRIES.map((c) => (
                <TouchableOpacity key={c} onPress={() => setValue('destination_country', c)} style={[styles.pill, destCountry === c && styles.pillActive]}>
                  <Text style={[styles.pillText, destCountry === c && styles.pillTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Card>

          {/* Cargo */}
          <Card title={t('freight.cargo', locale)} style={styles.card}>
            <Text style={styles.fieldLabel}>Cargo Type</Text>
            <Controller control={control} name="cargo_type" render={({ field }) => (
              <View style={styles.cargoGrid}>
                {CARGO_TYPES.map((ct) => (
                  <TouchableOpacity key={ct} onPress={() => field.onChange(ct)} style={[styles.pill, field.value === ct && styles.pillActive]}>
                    <Text style={[styles.pillText, field.value === ct && styles.pillTextActive]}>{ct}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )} />
            <Controller control={control} name="weight" render={({ field }) => (
              <Input label={`${t('freight.weight', locale)} (kg)`} placeholder="12000" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.weight?.message} />
            )} />
            <Controller control={control} name="volume" render={({ field }) => (
              <Input label={`${t('freight.volume', locale)} (m³)`} placeholder="33" value={field.value} onChangeText={field.onChange} keyboardType="numeric" />
            )} />
          </Card>

          {/* Price & Date */}
          <Card title={t('freight.price', locale)} style={styles.card}>
            <Controller control={control} name="price" render={({ field }) => (
              <Input label="Price (€)" placeholder="2500" value={field.value} onChangeText={field.onChange} keyboardType="numeric" error={errors.price?.message} leftIcon="cash-outline" />
            )} />
            <Controller control={control} name="loading_date" render={({ field }) => (
              <Input label={t('freight.loadingDate', locale)} placeholder="2025-01-15" value={field.value} onChangeText={field.onChange} error={errors.loading_date?.message} leftIcon="calendar-outline" />
            )} />
          </Card>

          {/* Description */}
          <Card title={t('common.description', locale)} style={styles.card}>
            <Controller control={control} name="description" render={({ field }) => (
              <Input label="" placeholder="Additional info..." value={field.value} onChangeText={field.onChange} multiline numberOfLines={4} style={{ height: 100, textAlignVertical: 'top' }} />
            )} />
          </Card>

          <Button title={t('freight.create', locale)} onPress={handleSubmit((d) => createMutation.mutate(d))} loading={createMutation.isPending} icon={<Ionicons name="checkmark-circle" size={18} color={Colors.white} />} style={styles.submitBtn} />

          <View style={{ height: Spacing.xxxl * 2 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.xxl, paddingVertical: Spacing.lg, gap: Spacing.md },
  backBtn: { marginRight: Spacing.sm },
  headerTitle: { flex: 1, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.text },
  scrollContent: { paddingHorizontal: Spacing.xxl },
  card: { marginBottom: Spacing.lg },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.text, marginBottom: Spacing.sm, marginTop: Spacing.md },
  scroll: { marginBottom: Spacing.md },
  pill: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  pillActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pillText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  pillTextActive: { color: Colors.white },
  cargoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  submitBtn: { marginTop: Spacing.lg },
});
